import { queryOptions } from "@tanstack/react-query";
import type { Cart } from "@/entities/cart";
import { getCart } from "./cart-queries";

async function fetchCart(): Promise<Cart | null> {
  const result = await getCart();

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.cart;
}

export const cartQueryOptions = () =>
  queryOptions({
    queryKey: ["cart"] as const,
    queryFn: fetchCart,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
