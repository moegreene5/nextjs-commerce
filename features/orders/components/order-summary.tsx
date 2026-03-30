import { Skeleton } from "@/components/ui/skeleton";
import { getCart } from "@/features/cart/cart-queries";
import FreeShippingProgress from "@/features/cart/components/free-shipping-threshold";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatPrice } from "@/utils/format-price";
import { redirect } from "next/navigation";
import OrderItem from "./order-item";

export default async function OrderSummary() {
  const data = await getCart();

  if (!data.success || !data.cart || data.cart.items.length === 0) {
    redirect("/cart");
  }

  const { cart } = data;
  const isFree = cart.subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold font-geologica text-stone-900 tracking-tight">
        Order Summary
      </h2>

      <ul className="divide-y divide-border">
        {cart.items.map((item) => (
          <OrderItem key={item.variantId} cartItem={item} />
        ))}
      </ul>

      <FreeShippingProgress subtotal={cart.subtotal} showLabel />

      <div className="space-y-2 text-sm font-geologica">
        <div className="flex items-center justify-between">
          <span className="text-stone-600">
            Subtotal{" "}
            <span className="text-stone-400">({cart.totalQuantity})</span>
          </span>
          <span className="tabular-nums font-medium text-stone-800">
            {formatPrice(cart.subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-stone-600">Shipping</span>
          <span className="text-stone-800">
            {isFree ? "Free" : "Calculated at checkout"}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
        <span className="font-semibold text-stone-900 font-geologica">
          Total
        </span>
        <span className="font-semibold text-stone-900 font-geologica tabular-nums">
          {formatPrice(cart.subtotal)}
        </span>
      </div>
    </div>
  );
}

export function OrderSummarySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-36 bg-gray-200" />
      <div className="divide-y divide-border">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-2">
            <div className="flex gap-3 items-center">
              <Skeleton className="h-16 w-16 rounded-md bg-gray-200 shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 bg-gray-200" />
                <Skeleton className="h-3 w-16 bg-gray-200" />
              </div>
            </div>
            <Skeleton className="h-4 w-16 bg-gray-200 shrink-0" />
          </div>
        ))}
      </div>

      <Skeleton className="h-2.5 w-full bg-gray-200" />

      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24 bg-gray-200" />
          <Skeleton className="h-4 w-16 bg-gray-200" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16 bg-gray-200" />
          <Skeleton className="h-4 w-12 bg-gray-200" />
        </div>
      </div>

      <div className="pt-4 border-t border-stone-200 flex justify-between">
        <Skeleton className="h-5 w-10 bg-gray-200" />
        <Skeleton className="h-5 w-20 bg-gray-200" />
      </div>
    </div>
  );
}
