"use server";

import { collections, store } from "@/lib/firebase/admin";
import { getOrCreateGuestId, getUserFromSession } from "@/lib/session";
import { AddToCartInput, addToCartSchema } from "@/schema/cart.schema";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";

export type CartActionResult =
  | { success: true }
  | { success: false; error: string };

export async function addToCart(
  input: AddToCartInput,
): Promise<CartActionResult> {
  try {
    const result = addToCartSchema.safeParse(input);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? "Invalid input";
      return { success: false, error: firstError };
    }

    const { productId, price, quantity } = result.data;

    const cookieStore = await cookies();
    const session = await getUserFromSession(cookieStore);
    const cartId = session?.user.uid ?? getOrCreateGuestId(cookieStore);

    const cartRef = store.collection(collections.cart).doc(cartId);
    const cartItemRef = cartRef
      .collection(collections.cartItems)
      .doc(productId);
    const productRef = store.collection(collections.product).doc(productId);

    await store.runTransaction(async (transaction) => {
      const [cartItemSnap, productSnap] = await Promise.all([
        transaction.get(cartItemRef),
        transaction.get(productRef),
      ]);

      if (!productSnap.exists) {
        throw Object.assign(new Error("Product does not exist"), {
          code: "NOT_FOUND",
        });
      }

      const product = productSnap.data() as {
        quantityInStore: number;
      };

      if (typeof product.quantityInStore !== "number") {
        throw Object.assign(new Error("Product is not available"), {
          code: "UNAVAILABLE",
        });
      }

      const currentCartQuantity: number = cartItemSnap.exists
        ? cartItemSnap.data()?.quantity ?? 0
        : 0;

      const totalQuantity = currentCartQuantity + quantity;

      if (totalQuantity > product.quantityInStore) {
        const remaining = product.quantityInStore - currentCartQuantity;
        throw Object.assign(
          new Error(
            remaining <= 0
              ? "This item is already at max quantity in your cart"
              : `Only ${remaining} left in stock`,
          ),
          { code: "OUT_OF_STOCK" },
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
          priceAtAdded: price,
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
          totalItems: FieldValue.increment(quantity),
          lastActiveAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    });

    return { success: true };
  } catch (error: any) {
    if (
      ["NOT_FOUND", "UNAVAILABLE", "BELOW_MINIMUM", "OUT_OF_STOCK"].includes(
        error?.code,
      )
    ) {
      return { success: false, error: error.message };
    }

    console.error("addToCart error:", error);
    return { success: false, error: "Failed to add item to cart" };
  }
}
