import { Cart, CartItem, PriceChange } from "@/entities/cart";

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

export function createEmptyCart(cartId: string): Cart {
  const now = new Date();
  return {
    cartId,
    items: [],
    totalItems: 0,
    totalQuantity: 0,
    subtotal: 0,
    lastActiveAt: now.toISOString(),
    updatedAt: now.toISOString(),
    createdAt: now.toISOString(),
  };
}

export function recalcTotals(
  items: CartItem[],
): Pick<Cart, "totalItems" | "totalQuantity" | "subtotal"> {
  return {
    totalItems: items.length,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + i.currentPrice * i.quantity, 0),
  };
}
