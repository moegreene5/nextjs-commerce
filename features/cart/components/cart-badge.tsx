import { getQueryClient } from "@/lib/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cartQueryOptions } from "../queries";
import CartBadgeClient from "./cart-badge-client";

export default async function CartBadge() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(cartQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CartBadgeClient />
    </HydrationBoundary>
  );
}
