import { cartQueryOptions } from "@/features/cart/queries";
import { getQueryClient } from "@/lib/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { Suspense } from "react";
import CartPageClient, {
  CartPageSkeleton,
} from "./components/cart-page-client";

export const metadata: Metadata = { title: "Your Shopping Cart" };

export default function Page() {
  return (
    <main className="min-h-[calc(100svh-80px)] pb-16">
      <Suspense fallback={<CartPageSkeleton />}>
        <CartData />
      </Suspense>
    </main>
  );
}

async function CartData() {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(cartQueryOptions());
  } catch {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CartPageClient />
    </HydrationBoundary>
  );
}
