import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCart } from "@/features/cart/cart-queries";
import CartItemCard from "@/features/cart/components/cart-item";
import FreeShippingProgress from "@/features/cart/components/free-shipping-threshold";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatPrice } from "@/utils/format-price";
import Link from "next/link";
import { Suspense } from "react";

export default function Page() {
  return (
    <main className="min-h-[calc(100svh-80px)] pb-16">
      <Suspense fallback={<CartPageSkeleton />}>
        <CartPage />
      </Suspense>
    </main>
  );
}

async function CartPage() {
  const data = await getCart();

  if (!data.success) {
    return (
      <div className="px-page py-4 md:py-8">
        <h1 className="text-2xl font-bold font-geologica text-stone-900 tracking-tight mb-8">
          Cart
        </h1>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <p className="text-stone-400 text-sm">Failed to load your cart.</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/collections/shop-all">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!data.cart || data.cart.items.length === 0) {
    return (
      <div className="px-page py-10">
        <h1 className="text-2xl font-bold font-geologica text-stone-900 tracking-tight mb-10">
          Cart
        </h1>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <p className="text-stone-700 font-semibold font-geologica">
            Your cart is empty
          </p>
          <p className="text-stone-400 text-sm">
            Add some items to get started.
          </p>
          <Button size="sm" asChild className="mt-1">
            <Link href="/collections/shop-all">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { cart } = data;
  const isFree = cart.subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="px-page py-4 md:py-10">
      <h1 className="text-2xl font-bold font-geologica text-stone-900 tracking-tight mb-4 md:mb-5">
        Your Cart ({cart.totalQuantity})
      </h1>

      <div className="grid lg:grid-cols-[60fr_40fr] xl:grid-cols-[65fr_35fr] gap-12 xl:gap-20 items-start">
        <div className="flex-1 min-w-0">
          <div className="divide-y divide-border">
            {cart.items.map((item) => (
              <CartItemCard isCartPage key={item.variantId} item={item} />
            ))}
          </div>
        </div>

        <div className="w-full lg:sticky lg:top-6 shrink-0">
          <div className="border-t-2 border-border pt-5 lg:border-t-0 lg:pt-0 space-y-6">
            <FreeShippingProgress subtotal={cart.subtotal} showLabel />

            <div className="space-y-1.5 font-geologica text-sm">
              <div className="flex items-center justify-between">
                <span>
                  Subtotal&nbsp;
                  <span>({cart.totalQuantity})</span>
                </span>
                <span className="tabular-nums font-medium text-stone-800 font-geologica">
                  {formatPrice(cart.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>{isFree ? "Free" : "Calculated at checkout"}</span>
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

            <div className="space-y-3">
              <Button
                className="w-full h-12 uppercase tracking-widest text-xs font-semibold border border-primary rounded-none"
                asChild
              >
                <Link href="/account">Checkout</Link>
              </Button>

              <Button
                variant="outline"
                className="w-full rounded-none h-12 uppercase tracking-widest text-xs font-semibold"
                asChild
              >
                <Link href="/collections/shop-all">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <div className="px-page py-4 md:py-10">
      <Skeleton className="h-8 w-32 mb-4 md:mb-5 bg-gray-200" />
      <div className="flex flex-col lg:flex-row gap-12 xl:gap-20 lg:items-start">
        <div className="flex-1 min-w-0">
          <div className="divide-y divide-stone-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <CartItemCardSkeleton key={i} />
            ))}
          </div>
        </div>

        <div className="w-full lg:w-72 xl:w-80 shrink-0">
          <div className="border-t-2 border-gray-200 pt-5">
            <Skeleton className="h-2.5 w-24 mb-5 bg-gray-200" />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 bg-gray-200" />
                <Skeleton className="h-4 w-16 bg-gray-200" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-16 bg-gray-200" />
                <Skeleton className="h-3 w-20 bg-gray-200" />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-stone-200 flex justify-between items-center">
              <Skeleton className="h-5 w-10 bg-gray-200" />
              <Skeleton className="h-5 w-20 bg-gray-200" />
            </div>

            <Skeleton className="h-11 w-full mt-5 rounded-lg bg-gray-200" />
            <Skeleton className="h-3 w-28 mx-auto mt-3 bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CartItemCardSkeleton() {
  return (
    <div className="flex items-center gap-3 py-4 border-b border-border last:border-none">
      <Skeleton className="h-33 w-26.5 bg-gray-200" />

      <div className="flex flex-1 flex-col min-w-0 gap-12">
        <div className="flex items-start justify-between gap-5">
          <div className="flex flex-col gap-1 min-w-0 w-full">
            <Skeleton className="h-4 w-3/4 bg-gray-200" />
            <Skeleton className="h-3 w-16 bg-gray-200" />
          </div>

          <Skeleton className="h-4 w-4 bg-gray-200 shrink-0" />
        </div>

        <div className="flex items-center justify-between gap-5">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-16 bg-gray-200" />
            <Skeleton className="h-3 w-20 bg-gray-200" />
          </div>

          <div className="flex items-center gap-1.5 border border-gray-200 rounded-full px-1 py-0.5">
            <Skeleton className="size-6 rounded-full bg-gray-200" />
            <Skeleton className="h-4 w-4 bg-gray-200" />
            <Skeleton className="size-6 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
