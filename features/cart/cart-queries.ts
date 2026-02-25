"use server";

import { Cart, CartItem, PriceChange } from "@/entities/cart";
import { collections, store } from "@/lib/firebase/admin";
import { getGuestId, getUserFromSession } from "@/lib/session";
import { cookies } from "next/headers";
import { cache } from "react";

export type GetCartResult =
  | { success: true; cart: Cart }
  | { success: true; cart: null }
  | { success: false; error: string };

function computePriceChange(
  priceAtAdded: number,
  currentPrice: number,
): PriceChange {
  if (priceAtAdded === currentPrice) return { changed: false };

  const direction = currentPrice > priceAtAdded ? "up" : "down";
  const percentage = Math.abs(
    ((currentPrice - priceAtAdded) / priceAtAdded) * 100,
  );

  return {
    changed: true,
    direction,
    percentage: Math.round(percentage * 10) / 10,
    previousPrice: priceAtAdded,
    currentPrice,
  };
}

export const getCart = cache(async (): Promise<GetCartResult> => {
  try {
    const cookieStore = await cookies();
    const session = await getUserFromSession(cookieStore);
    const cartId = session?.user.uid ?? getGuestId(cookieStore);

    if (!cartId) return { success: true, cart: null };

    const cartRef = store.collection(collections.cart).doc(cartId);

    const [cartSnap, itemsSnap] = await Promise.all([
      cartRef.get(),
      cartRef.collection(collections.cartItems).get(),
    ]);

    if (!cartSnap.exists || itemsSnap.empty) {
      return { success: true, cart: null };
    }

    const cartData = cartSnap.data()!;

    const productRefs = itemsSnap.docs.map((doc) =>
      store.collection(collections.product).doc(doc.data().productId),
    );
    const productSnaps = await store.getAll(...productRefs);

    const validItemDocs = itemsSnap.docs.filter(
      (doc) => productSnaps.find((p) => p.id === doc.data().productId)?.exists,
    );

    if (validItemDocs.length === 0) return { success: true, cart: null };

    const items: CartItem[] = validItemDocs.map((doc) => {
      const d = doc.data();
      const productSnap = productSnaps.find((p) => p.id === d.productId)!;
      const productData = productSnap.data()!;

      const currentPrice: number = productData.price;

      return {
        productId: d.productId,
        name: productData.name,
        image: Array.isArray(productData.image)
          ? productData.image[0]
          : productData.image,
        quantity: d.quantity,
        priceAtAdded: d.priceAtAdded,
        currentPrice,
        priceChange: computePriceChange(d.priceAtAdded, currentPrice),
        addedAt: d.addedAt?.toDate(),
        updatedAt: d.updatedAt?.toDate(),
      };
    });

    const subtotal = items.reduce(
      (sum, item) => sum + item.currentPrice * item.quantity,
      0,
    );

    return {
      success: true,
      cart: {
        cartId,
        isGuest: cartData.isGuest ?? !session,
        totalItems: cartData.totalItems ?? 0,
        subtotal,
        items,
        lastActiveAt: cartData.lastActiveAt?.toDate(),
        updatedAt: cartData.updatedAt?.toDate(),
        createdAt: cartData.createdAt?.toDate(),
      },
    };
  } catch (error) {
    console.error("getCart error:", error);
    return { success: false, error: "Failed to get cart" };
  }
});
