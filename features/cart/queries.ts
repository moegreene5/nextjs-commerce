import type { Cart, GetCartResult } from "@/entities/cart";
import { queryOptions } from "@tanstack/react-query";

async function fetchCartClient(): Promise<Cart> {
  const response = await fetch("/api/cart", {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`,
    );
  }

  const result: GetCartResult = await response.json();
  if (!result.success) throw new Error(result.error || "Failed to parse cart");
  return result.cart;
}

export const cartQueryOptions = () =>
  queryOptions({
    queryKey: ["cart"] as const,
    queryFn: fetchCartClient,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
