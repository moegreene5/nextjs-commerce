import CartHydrationBoundary from "@/features/cart/components/cart-hydration-boundary";
import { Metadata } from "next";
import { Suspense } from "react";
import { default as CartData, CartPageSkeleton } from "./components/cart-data";

export const metadata: Metadata = { title: "Your Shopping Cart" };

export default function Page() {
  return (
    <div className="min-h-[calc(100svh-80px)] pb-16">
      <Suspense fallback={<CartPageSkeleton />}>
        <CartHydrationBoundary>
          <CartData />
        </CartHydrationBoundary>
      </Suspense>
    </div>
  );
}
