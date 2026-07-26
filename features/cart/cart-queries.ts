"use server";

import { CartItem, GetCartResult } from "@/entities/cart";
import { computePriceChange, createEmptyCart } from "@/lib/cart";
import { collections, store } from "@/lib/firebase/admin";
import { normalizeProductDoc } from "@/lib/product";
import { Cookies, getGuestId, getUserFromSession } from "@/lib/session";
import { cookies } from "next/headers";
import { cache } from "react";

export async function getCartId(cookies: Cookies): Promise<string | null> {
  const session = await getUserFromSession(cookies, false);
  if (session?.user.uid) return session.user.uid;

  return getGuestId(cookies);
}

export const getCart = cache(async (): Promise<GetCartResult> => {
  const cookieStore = await cookies();
  const cartId = await getCartId(cookieStore);

  return getCartById(cartId);
});

export async function getCartById(
  cartId: string | null,
): Promise<GetCartResult> {
  if (!cartId) return { success: true, cart: createEmptyCart("") };

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
      return { success: true, cart: createEmptyCart(cartId) };
    }

    const cartData = cartSnap.data()!;

    const productRefs = itemsSnap.docs.map((doc) =>
      store.collection(collections.products).doc(doc.data().productId),
    );
    const productSnaps = await store.getAll(...productRefs);

    const validItemDocs = itemsSnap.docs.filter(
      (doc) => productSnaps.find((p) => p.id === doc.data().productId)?.exists,
    );

    if (validItemDocs.length === 0) {
      return { success: true, cart: createEmptyCart(cartId) };
    }

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
        sku: variant?.sku,
        name: product.name,
        image: product.images[0]?.url ?? "",
        quantity: d.quantity,
        priceAtAdded: d.priceAtAdded,
        currentPrice,
        priceChange: computePriceChange(d.priceAtAdded, currentPrice),
        addedAt: d.addedAt?.toDate().toISOString() ?? new Date().toISOString(),
        updatedAt:
          d.updatedAt?.toDate().toISOString() ?? new Date().toISOString(),
      };
    });

    const subtotal = items.reduce(
      (sum, item) => sum + item.currentPrice * item.quantity,
      0,
    );

    const totalQuantity = items.reduce(
      (acc, current) => acc + current.quantity,
      0,
    );

    return {
      success: true,
      cart: {
        cartId,
        totalQuantity: totalQuantity,
        totalItems: cartData.totalItems ?? 0,
        subtotal,
        items,
        lastActiveAt:
          cartData.lastActiveAt?.toDate().toISOString() ??
          new Date().toISOString(),
        updatedAt:
          cartData.updatedAt?.toDate().toISOString() ??
          new Date().toISOString(),
        createdAt:
          cartData.createdAt?.toDate().toISOString() ??
          new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("getCart error:", error);
    return { success: false, error: "Failed to get cart" };
  }
}
