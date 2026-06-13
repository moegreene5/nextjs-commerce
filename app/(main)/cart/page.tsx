import { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import CartData, {
  CartErrorState,
  CartPageSkeleton,
} from "./components/cart-data";

export const metadata: Metadata = { title: "Your Shopping Cart" };

export default function Page() {
  return (
    <main className="min-h-[calc(100svh-80px)] pb-16">
      <ErrorBoundary fallback={<CartErrorState />}>
        <Suspense fallback={<CartPageSkeleton />}>
          <CartData />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
