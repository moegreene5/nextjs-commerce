import CartItemCard from "@/features/cart/components/cart-item";
import FreeShippingProgress from "@/features/cart/components/free-shipping-threshold";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { useCartStore } from "@/store/cart";
import { useModalStore } from "@/store/modal";
import { formatPrice } from "@/utils/format-price";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

export default function CartSheet() {
  const modals = useModalStore((s) => s.modals);
  const closeModal = useModalStore((s) => s.closeModal);
  const data = useCartStore((s) => s.cart);
  const cartData = data?.success ? data.cart : null;
  const items = cartData?.items ?? [];
  const isEmpty = items.length === 0;
  const isFree = (cartData?.subtotal ?? 0) >= FREE_SHIPPING_THRESHOLD;

  return (
    <Sheet open={!!modals["cart"]} onOpenChange={() => closeModal("cart")}>
      <SheetContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full! max-w-152.5! border-none px-0 flex flex-col"
      >
        <div className="flex flex-col h-full overflow-hidden">
          <SheetHeader className="px-page py-4 md:py-6 space-y-3.5 shrink-0">
            <SheetTitle
              tabIndex={-1}
              autoFocus
              className="font-semibold text-xl md:text-2xl outline-none"
            >
              Your Cart {isEmpty && "is empty"}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Review your cart items, update quantities, and proceed to
              checkout.
            </SheetDescription>
            <FreeShippingProgress subtotal={cartData?.subtotal ?? 0} />
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-page">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 py-16 text-center px-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center">
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 36 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-stone-300"
                    >
                      <path
                        d="M7 10h22l-2.5 18H9.5L7 10Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13 10V8a5 5 0 0 1 10 0v2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M14 17h8M18 14v6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-stone-200" />
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-stone-100" />
                </div>

                <div className="space-y-1.5">
                  <p className="text-stone-800 text-sm font-semibold tracking-wide">
                    Nothing here yet
                  </p>
                  <p className="text-stone-400 text-xs leading-relaxed max-w-48">
                    Looks like you haven't added anything to your cart
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="rounded-full px-8 text-xs uppercase tracking-widest font-semibold h-10 border-stone-200 hover:border-stone-800 hover:text-stone-800 transition-colors"
                  asChild
                >
                  <Link href="/collections/shop-all">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="py-2">
                {items.map((item) => (
                  <CartItemCard key={item.variantId} item={item} />
                ))}
              </div>
            )}
          </div>

          {!isEmpty && (
            <div className="shrink-0 border-t border-stone-100 px-page py-4 md:py-6 space-y-4">
              <div className="space-y-2 font-geologica">
                <div className="flex items-center justify-between text-xs text-primary font-semibold md:text-sm">
                  <span>
                    Total ({cartData?.totalQuantity}{" "}
                    {cartData?.totalQuantity === 1 ? "item" : "items"})
                  </span>
                  <span>
                    {isFree ? "Free" : "Shipping calculated at checkout"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-800">
                    Subtotal
                  </span>
                  <span className="text-sm font-semibold text-stone-900 tabular-nums font-geologica">
                    {formatPrice(cartData?.subtotal ?? 0)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full rounded-full h-12 uppercase tracking-widest text-xs font-semibold border border-primary"
                asChild
              >
                <Link href="/account" onClick={() => closeModal("cart")}>
                  Checkout
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full rounded-full h-12 uppercase tracking-widest text-xs font-semibold"
                asChild
              >
                <Link
                  href="/collections/shop-all"
                  onClick={() => closeModal("cart")}
                >
                  Continue Shopping
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
