"use server";

import { Cart, CartItem } from "@/entities/cart";
import { ProductDocument } from "@/entities/product";
import { AppError } from "@/lib/errors";
import { collections, store } from "@/lib/firebase/admin";
import { normalizeProductDoc } from "@/lib/product";
import {
  clearGuestSession,
  getGuestId,
  getOrCreateGuestId,
  getUserFromSession,
} from "@/lib/session";
import {
  AddToCartInput,
  addToCartSchema,
  IncreaseOrDecreaseInput,
  increaseOrDecreaseQuantitySchema,
  RemoveFromCartInput,
  removeFromCartSchema,
} from "@/schema/cart.schema";
import { FieldValue } from "firebase-admin/firestore";
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
    const session = await getUserFromSession(cookieStore, false);
    const cartId = session?.user.uid ?? getOrCreateGuestId(cookieStore);

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

      if (variant.quantityInStore < 1)
        throw new AppError("Out of stock", "OUT_OF_STOCK");

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
          isGuest: !session,
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
  const result = removeFromCartSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { variantId } = result.data;

  try {
    const cookieStore = await cookies();
    const session = await getUserFromSession(cookieStore, false);
    const cartId = session?.user.uid ?? getGuestId(cookieStore);

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
    const session = await getUserFromSession(cookieStore, false);
    const cartId = session ? session.user.uid : getGuestId(cookieStore);

    if (!cartId) return { success: false, error: "Cart not found." };

    const cartRef = store.collection(collections.cart).doc(cartId);
    const cartItemRef = cartRef
      .collection(collections.cartItems)
      .doc(variantId);
    const productRef = store.collection(collections.products).doc(productId);

    await store.runTransaction(async (tx) => {
      const [cartSnap, cartItemSnap] = await Promise.all([
        tx.get(cartRef),
        tx.get(cartItemRef),
      ]);

      if (!cartSnap.exists) throw new AppError("Cart not found.", "NOT_FOUND");
      if (!cartItemSnap.exists)
        throw new AppError("Item not found in cart.", "NOT_FOUND");

      const currentItem = cartItemSnap.data() as CartItem;
      const itemQuantityInCart = currentItem.quantity;
      const now = FieldValue.serverTimestamp();

      if (type === "increase") {
        const productSnap = await tx.get(productRef);
        if (!productSnap.exists)
          throw new AppError("Product does not exist anymore.", "NOT_FOUND");

        const product = productSnap.data() as ProductDocument;
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
        } else {
          tx.update(cartItemRef, {
            quantity: FieldValue.increment(-1),
            updatedAt: now,
          });
        }

        tx.update(cartRef, {
          totalQuantity: FieldValue.increment(-1),
          updatedAt: now,
          lastActiveAt: now,
          ...(itemQuantityInCart === 1 && {
            totalItems: FieldValue.increment(-1),
          }),
        });
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

export async function mergeGuestCartToUser(userId: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const guestId = getGuestId(cookieStore);

    if (!guestId || guestId === userId) return;

    const guestCartRef = store.collection(collections.cart).doc(guestId);
    const guestItemsRef = guestCartRef.collection(collections.cartItems);
    const guestItemsSnap = await guestItemsRef.get();

    if (guestItemsSnap.empty) {
      clearGuestSession(cookieStore);
      return;
    }

    const guestItems = guestItemsSnap.docs.map((doc) => ({
      docRef: doc.ref,
      data: doc.data() as CartItem,
    }));

    const productCollection = store.collection(collections.products);
    const uniqueProductIds = [
      ...new Set(guestItems.map((item) => item.data.productId)),
    ];
    const productRefs = uniqueProductIds.map((id) => productCollection.doc(id));
    const productSnaps = await store.getAll(...productRefs);

    const productMap = new Map(
      productSnaps.map((snap) => [
        snap.id,
        snap.data() as ProductDocument | undefined,
      ]),
    );

    await store.runTransaction(async (transaction) => {
      const userCartRef = store.collection(collections.cart).doc(userId);
      const userItemsRef = userCartRef.collection(collections.cartItems);

      const [userItemsSnap, userCartSnap] = await Promise.all([
        transaction.get(userItemsRef),
        transaction.get(userCartRef),
      ]);

      const userItemsMap = new Map(
        userItemsSnap.docs.map((doc) => [doc.id, doc.data() as CartItem]),
      );

      const userCartData = userCartSnap.data() as Cart | undefined;

      let totalQuantityAdded = 0;
      let totalItemsAdded = userCartData?.totalItems ?? 0;

      for (const { docRef: guestItemRef, data: guestItemData } of guestItems) {
        const { productId, variantId, quantity: guestQuantity } = guestItemData;

        const productData = productMap.get(productId);
        if (!productData) {
          transaction.delete(guestItemRef);
          continue;
        }

        const variant = productData.variants?.find((v) => v.id === variantId);
        if (!variant) {
          transaction.delete(guestItemRef);
          continue;
        }

        if (!userItemsMap.has(variantId) && totalItemsAdded >= MAX_CART_ITEMS)
          continue;

        const quantityInStore = variant.quantityInStore ?? 0;
        const userItemRef = userItemsRef.doc(variantId); // use variantId as doc ID
        const existingUserQuantity = userItemsMap.get(variantId)?.quantity ?? 0;
        const proposedTotal = existingUserQuantity + guestQuantity;

        if (proposedTotal > quantityInStore) {
          const availableToAdd = Math.max(
            0,
            quantityInStore - existingUserQuantity,
          );

          if (availableToAdd > 0) {
            if (userItemsMap.has(variantId)) {
              transaction.update(userItemRef, {
                quantity: existingUserQuantity + availableToAdd,
                updatedAt: FieldValue.serverTimestamp(),
              });
            } else {
              transaction.set(userItemRef, {
                ...guestItemData,
                quantity: availableToAdd,
                updatedAt: FieldValue.serverTimestamp(),
              });
              totalItemsAdded++;
            }
            totalQuantityAdded += availableToAdd;
          }
        } else {
          if (userItemsMap.has(variantId)) {
            transaction.update(userItemRef, {
              quantity: proposedTotal,
              updatedAt: FieldValue.serverTimestamp(),
            });
          } else {
            transaction.set(userItemRef, {
              ...guestItemData,
              quantity: guestQuantity,
              updatedAt: FieldValue.serverTimestamp(),
            });
            totalItemsAdded++;
          }
          totalQuantityAdded += guestQuantity;
        }

        transaction.delete(guestItemRef);
      }

      const existingTotal = userCartData?.totalQuantity ?? 0;

      transaction.set(
        userCartRef,
        {
          cartId: userId,
          isGuest: false,
          totalQuantity: existingTotal + totalQuantityAdded,
          totalItems: totalItemsAdded,
          lastActiveAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: userCartData?.createdAt ?? FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      transaction.delete(guestCartRef);
    });

    clearGuestSession(cookieStore);
  } catch (error) {
    console.error("mergeGuestCartToUser error:", error);
  }
}
