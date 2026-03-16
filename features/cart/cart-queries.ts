import "server-only";

import { Cart, CartItem, PriceChange } from "@/entities/cart";
import { collections, store } from "@/lib/firebase/admin";
import { normalizeProductDoc } from "@/lib/product";
import { getGuestId, getUserFromSession } from "@/lib/session";
import { cookies } from "next/headers";
import { cache } from "react";

export type GetCartResult =
  | { success: true; cart: Cart }
  | { success: true; cart: null }
  | { success: false; error: string };

export function computePriceChange(
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
  const cookieStore = await cookies();
  const session = await getUserFromSession(cookieStore);
  const cartId = session?.user.uid ?? getGuestId(cookieStore);

  if (!cartId) return { success: true, cart: null };

  try {
    const cartRef = store.collection(collections.cart).doc(cartId);

    const [cartSnap, itemsSnap] = await Promise.all([
      cartRef.get(),
      cartRef
        .collection(collections.cartItems)
        .orderBy("addedAt", "desc")
        .get(),
    ]);

    if (!cartSnap.exists || itemsSnap.empty) {
      return { success: true, cart: null };
    }

    const cartData = cartSnap.data()!;

    const productRefs = itemsSnap.docs.map((doc) =>
      store.collection(collections.products).doc(doc.data().productId),
    );
    const productSnaps = await store.getAll(...productRefs);

    const validItemDocs = itemsSnap.docs.filter(
      (doc) => productSnaps.find((p) => p.id === doc.data().productId)?.exists,
    );

    if (validItemDocs.length === 0) return { success: true, cart: null };

    const items: CartItem[] = validItemDocs.map((doc) => {
      const d = doc.data();

      const productSnap = productSnaps.find(
        (p) => p.id === d.productId,
      ) as FirebaseFirestore.QueryDocumentSnapshot;

      const product = normalizeProductDoc(productSnap);

      const variant = product.variants.find((v) => v.id === d.variantId);
      const currentPrice = variant?.displayPrice ?? d.priceAtAdded;

      return {
        productId: d.productId,
        variantId: d.variantId,
        size: d.size ?? variant?.size ?? "",
        slug: product.slug,
        name: product.name,
        image: product.images[0]?.url,
        quantity: d.quantity,
        priceAtAdded: d.priceAtAdded,
        currentPrice,
        priceChange: computePriceChange(d.priceAtAdded, currentPrice),
        addedAt: d.addedAt?.toDate() ?? new Date(),
        updatedAt: d.updatedAt?.toDate() ?? new Date(),
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
        totalQuantity: cartData.totalQuantity ?? 0,
        totalItems: cartData.totalItems ?? 0,
        subtotal,
        items,
        lastActiveAt: cartData.lastActiveAt?.toDate() ?? new Date(),
        updatedAt: cartData.updatedAt?.toDate() ?? new Date(),
        createdAt: cartData.createdAt?.toDate() ?? new Date(),
      },
    };
  } catch (error) {
    console.error("getCart error:", error);
    return { success: false, error: "Failed to get cart" };
  }
});
