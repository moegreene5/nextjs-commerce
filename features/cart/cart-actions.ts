"use server";

import { Cart, CartItemDocument } from "@/entities/cart";
import { Profile } from "@/entities/user";
import { AppError } from "@/lib/errors";
import { collections, store } from "@/lib/firebase/admin";
import { normalizeProductDoc } from "@/lib/product";
import { getCartId, getOrCreateCartId, setCartId } from "@/lib/session";
import {
  AddToCartInput,
  addToCartSchema,
  IncreaseOrDecreaseInput,
  increaseOrDecreaseQuantitySchema,
  RemoveFromCartInput,
  removeFromCartSchema,
} from "@/schema/cart.schema";
import { DocumentReference, FieldValue } from "firebase-admin/firestore";
import { refresh } from "next/cache";
import { cookies } from "next/headers";

const MAX_CART_ITEMS = 50;

export type CartActionResult =
  | { success: true }
  | { success: false; error: string };

export async function addToCart(
  input: AddToCartInput,
): Promise<CartActionResult> {
  try {
    const result = addToCartSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { productId, variantId, quantity } = result.data;

    const cookieStore = await cookies();
    const cartId = getOrCreateCartId(cookieStore);

    const cartRef = store.collection(collections.cart).doc(cartId);
    const cartItemRef = cartRef
      .collection(collections.cartItems)
      .doc(variantId);
    const productRef = store.collection(collections.products).doc(productId);

    await store.runTransaction(async (transaction) => {
      const [cartSnap, cartItemSnap, productSnap] = await Promise.all([
        transaction.get(cartRef),
        transaction.get(cartItemRef),
        transaction.get(productRef),
      ]);

      if (!productSnap.exists)
        throw new AppError("Product does not exist", "NOT_FOUND");

      const product = normalizeProductDoc(
        productSnap as FirebaseFirestore.QueryDocumentSnapshot,
      );
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) throw new AppError("Variant not found", "NOT_FOUND");

      if (variant.quantityInStore < 1)
        throw new AppError("Out of stock", "OUT_OF_STOCK");

      const currentTotalItems = cartSnap.exists
        ? cartSnap.data()?.totalItems ?? 0
        : 0;

      if (!cartItemSnap.exists && currentTotalItems >= MAX_CART_ITEMS) {
        throw new AppError("Your cart is full.", "CART_FULL");
      }

      const currentCartQuantity = cartItemSnap.exists
        ? cartItemSnap.data()?.quantity ?? 0
        : 0;
      const totalQuantityInCart = currentCartQuantity + quantity;

      if (totalQuantityInCart > variant.quantityInStore) {
        const remaining = variant.quantityInStore - currentCartQuantity;
        throw new AppError(
          remaining <= 0
            ? "This item is already at max quantity in your cart"
            : `Only ${remaining} left in stock`,
          "OUT_OF_STOCK",
        );
      }

      if (cartItemSnap.exists) {
        transaction.update(cartItemRef, {
          quantity: FieldValue.increment(quantity),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        transaction.set(cartItemRef, {
          productId,
          variantId,
          size: variant.size,
          priceAtAdded: variant.displayPrice,
          quantity,
          addedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      transaction.set(
        cartRef,
        {
          cartId,
          totalQuantity: FieldValue.increment(quantity),
          lastActiveAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          ...(!cartSnap.exists && { createdAt: FieldValue.serverTimestamp() }),
          ...(!cartItemSnap.exists && { totalItems: FieldValue.increment(1) }),
        },
        { merge: true },
      );
    });

    refresh();
    return { success: true };
  } catch (error) {
    if (error instanceof AppError)
      return { error: error.message, success: false };
    console.error("addToCart error:", error);
    return { success: false, error: "Failed to add item to cart" };
  }
}

export async function removeItemFromCart(
  data: RemoveFromCartInput,
): Promise<CartActionResult> {
  try {
    const result = removeFromCartSchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { variantId } = result.data;

    const cookieStore = await cookies();
    const cartId = getCartId(cookieStore);

    if (!cartId) return { success: false, error: "Cart not found" };

    const cartRef = store.collection(collections.cart).doc(cartId);
    const cartItemRef = cartRef
      .collection(collections.cartItems)
      .doc(variantId);

    await store.runTransaction(async (transaction) => {
      const [cartSnap, cartItemSnap] = await Promise.all([
        transaction.get(cartRef),
        transaction.get(cartItemRef),
      ]);

      if (!cartSnap.exists) throw new AppError("Cart not found.", "NOT_FOUND");
      if (!cartItemSnap.exists)
        throw new AppError("Item not found in cart.", "NOT_FOUND");

      const removedQuantity: number = cartItemSnap.data()?.quantity ?? 0;

      transaction.delete(cartItemRef);
      transaction.update(cartRef, {
        totalQuantity: FieldValue.increment(-removedQuantity),
        totalItems: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
        lastActiveAt: FieldValue.serverTimestamp(),
      });
    });

    refresh();
    return { success: true };
  } catch (error) {
    if (error instanceof AppError)
      return { success: false, error: error.message };
    console.error("failed to remove item from cart error:", error);
    return { success: false, error: "Failed to remove item from cart." };
  }
}

export async function incrementOrDecreaseQuantity(
  input: IncreaseOrDecreaseInput,
): Promise<CartActionResult> {
  const result = increaseOrDecreaseQuantitySchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { productId, variantId, type } = result.data;

  try {
    const cookieStore = await cookies();
    const cartId = getCartId(cookieStore);

    if (!cartId) return { success: false, error: "Cart not found." };

    const cartRef = store.collection(collections.cart).doc(cartId);
    const cartItemRef = cartRef
      .collection(collections.cartItems)
      .doc(variantId);

    await store.runTransaction(async (tx) => {
      const [cartSnap, cartItemSnap] = await Promise.all([
        tx.get(cartRef),
        tx.get(cartItemRef),
      ]);

      if (!cartSnap.exists) throw new AppError("Cart not found.", "NOT_FOUND");
      if (!cartItemSnap.exists)
        throw new AppError("Item not found in cart.", "NOT_FOUND");

      const currentItem = cartItemSnap.data() as CartItemDocument;
      const itemQuantityInCart = currentItem.quantity;
      const now = FieldValue.serverTimestamp();

      if (type === "increase") {
        const productRef = store
          .collection(collections.products)
          .doc(productId);
        const productSnap = await tx.get(productRef);
        if (!productSnap.exists)
          throw new AppError("Product does not exist anymore.", "NOT_FOUND");

        const product = normalizeProductDoc(
          productSnap as FirebaseFirestore.QueryDocumentSnapshot,
        );
        const variant = product.variants?.find((v) => v.id === variantId);
        if (!variant) throw new AppError("Variant not found.", "NOT_FOUND");

        if (itemQuantityInCart + 1 > variant.quantityInStore) {
          throw new AppError(
            "You have reached the maximum available stock.",
            "OUT_OF_STOCK",
          );
        }

        tx.update(cartItemRef, {
          quantity: FieldValue.increment(1),
          updatedAt: now,
        });
        tx.update(cartRef, {
          totalQuantity: FieldValue.increment(1),
          updatedAt: now,
          lastActiveAt: now,
        });
      } else {
        if (itemQuantityInCart === 1) {
          tx.delete(cartItemRef);
          tx.update(cartRef, {
            totalQuantity: FieldValue.increment(-1),
            totalItems: FieldValue.increment(-1),
            updatedAt: now,
            lastActiveAt: now,
          });
        } else {
          tx.update(cartItemRef, {
            quantity: FieldValue.increment(-1),
            updatedAt: now,
          });
          tx.update(cartRef, {
            totalQuantity: FieldValue.increment(-1),
            updatedAt: now,
            lastActiveAt: now,
          });
        }
      }
    });

    refresh();
    return { success: true };
  } catch (error) {
    const message =
      error instanceof AppError
        ? error.message
        : `Failed to ${type} item in cart.`;
    return { success: false, error: message };
  }
}

// ─── associateCartWithUser ────────────────────────────────────────────────────

export async function associateCartWithUser(userId: string): Promise<void> {
  if (!userId || typeof userId !== "string" || !userId.trim()) return;

  try {
    const cookieStore = await cookies();
    const currentCartId = getCartId(cookieStore);

    const userRef = store.collection(collections.profile).doc(userId);

    const storedCartId = await store.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const user = userSnap.data() as Profile | undefined;
      const existing: string | undefined = user?.cartId;

      if (!existing && currentCartId) {
        transaction.set(userRef, { cartId: currentCartId }, { merge: true });
        return currentCartId;
      }

      return existing;
    });

    if (!storedCartId || storedCartId === currentCartId) return;

    if (currentCartId) {
      await mergeCartsIntoTarget({
        sourceCartId: currentCartId,
        targetCartId: storedCartId,
      });
    }

    setCartId(storedCartId, cookieStore);
  } catch (error) {
    console.error("associateCartWithUser error:", error);
  }
}

async function mergeCartsIntoTarget({
  sourceCartId,
  targetCartId,
}: {
  sourceCartId: string;
  targetCartId: string;
}): Promise<void> {
  const sourceCartRef = store.collection(collections.cart).doc(sourceCartId);

  await store.runTransaction(async (transaction) => {
    const targetCartRef = store.collection(collections.cart).doc(targetCartId);
    const sourceItemsRef = sourceCartRef.collection(collections.cartItems);
    const targetItemsRef = targetCartRef.collection(collections.cartItems);

    const [sourceItemsSnap, targetItemsSnap, targetCartSnap] =
      await Promise.all([
        transaction.get(sourceItemsRef),
        transaction.get(targetItemsRef),
        transaction.get(targetCartRef),
      ]);

    if (sourceItemsSnap.empty) return;

    const sourceItems = sourceItemsSnap.docs.map((doc) => ({
      docRef: doc.ref as DocumentReference,
      data: doc.data() as CartItemDocument,
    }));

    const uniqueProductIds = [
      ...new Set(sourceItems.map((item) => item.data.productId)),
    ];
    const productRefs = uniqueProductIds.map((id) =>
      store.collection(collections.products).doc(id),
    );

    const productSnaps = await Promise.all(
      productRefs.map((ref) => transaction.get(ref)),
    );

    const productMap = new Map(
      productSnaps.map((snap) => [
        snap.id,
        snap.exists
          ? normalizeProductDoc(snap as FirebaseFirestore.QueryDocumentSnapshot)
          : undefined,
      ]),
    );

    const targetItemsMap = new Map(
      targetItemsSnap.docs.map((doc) => [
        doc.id,
        doc.data() as CartItemDocument,
      ]),
    );

    const targetCartData = targetCartSnap.data() as Cart | undefined;

    let totalQuantityAdded = 0;
    let totalItemsAdded = targetCartData?.totalItems ?? 0;

    const skippedVariantIds: string[] = [];

    for (const { docRef: sourceItemRef, data: sourceItemData } of sourceItems) {
      const { productId, variantId, quantity: sourceQuantity } = sourceItemData;

      const product = productMap.get(productId);
      if (!product) {
        transaction.delete(sourceItemRef);
        continue;
      }

      const variant = product.variants?.find((v) => v.id === variantId);
      if (!variant) {
        transaction.delete(sourceItemRef);
        continue;
      }

      if (!targetItemsMap.has(variantId) && totalItemsAdded >= MAX_CART_ITEMS) {
        skippedVariantIds.push(variantId);
        transaction.delete(sourceItemRef);
        continue;
      }

      const quantityInStore = variant.quantityInStore ?? 0;
      const targetItemRef = targetItemsRef.doc(variantId);
      const existingTargetQuantity =
        targetItemsMap.get(variantId)?.quantity ?? 0;
      const proposedTotal = existingTargetQuantity + sourceQuantity;

      if (proposedTotal > quantityInStore) {
        const availableToAdd = Math.max(
          0,
          quantityInStore - existingTargetQuantity,
        );

        if (availableToAdd > 0) {
          if (targetItemsMap.has(variantId)) {
            transaction.update(targetItemRef, {
              quantity: existingTargetQuantity + availableToAdd,
              updatedAt: FieldValue.serverTimestamp(),
            });
          } else {
            transaction.set(targetItemRef, {
              ...sourceItemData,
              quantity: availableToAdd,
              updatedAt: FieldValue.serverTimestamp(),
            });
            totalItemsAdded++;
          }
          totalQuantityAdded += availableToAdd;
        }
      } else {
        if (targetItemsMap.has(variantId)) {
          transaction.update(targetItemRef, {
            quantity: proposedTotal,
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          transaction.set(targetItemRef, {
            ...sourceItemData,
            quantity: sourceQuantity,
            updatedAt: FieldValue.serverTimestamp(),
          });
          totalItemsAdded++;
        }
        totalQuantityAdded += sourceQuantity;
      }

      transaction.delete(sourceItemRef);
    }

    if (skippedVariantIds.length > 0) {
      console.warn(
        `mergeCartsIntoTarget: ${skippedVariantIds.length} item(s) not merged ` +
          `because the target cart is full. ` +
          `Skipped variantIds: ${skippedVariantIds.join(", ")}`,
      );
    }

    const existingTotal = targetCartData?.totalQuantity ?? 0;

    transaction.delete(sourceCartRef);

    transaction.set(
      targetCartRef,
      {
        cartId: targetCartId,
        totalQuantity: existingTotal + totalQuantityAdded,
        totalItems: totalItemsAdded,
        lastActiveAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: targetCartData?.createdAt ?? FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
}
