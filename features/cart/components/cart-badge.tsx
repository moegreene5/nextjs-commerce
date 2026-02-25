import { cartQueryKey } from "@/utils/query-keys";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { getCart } from "../cart-queries";
import CartBadgeClient from "./cart-badge-client";

export default async function CartBadge() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryOptions({
      queryKey: cartQueryKey,
      queryFn: getCart,
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CartBadgeClient />
    </HydrationBoundary>
  );
}
