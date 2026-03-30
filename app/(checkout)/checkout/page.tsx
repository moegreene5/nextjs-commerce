import { Container } from "@/components/ui/container";
import OrderSummary, {
  OrderSummarySkeleton,
} from "@/features/orders/components/order-summary";
import { Suspense } from "react";

export default function Checkout() {
  return (
    <main>
      <Container className="grid lg:grid-cols-2 xl:grid-cols-[55fr_45fr]">
        <div className="lg:border-r w-full h-full lg:sticky top-0 px-page py-5 md:py-8"></div>

        <div className="lg:sticky top-0 px-page py-5 md:py-8">
          <Suspense fallback={<OrderSummarySkeleton />}>
            <OrderSummary />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}
