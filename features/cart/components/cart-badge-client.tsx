"use client";

import { useCartStore } from "@/store/cart";
import { useModalStore } from "@/store/modal";
import { ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GetCartResult } from "../cart-queries";

export default function CartBadgeClient({ data }: { data: GetCartResult }) {
  const openModal = useModalStore((s) => s.openModal);
  const setCart = useCartStore((s) => s.setCart);
  const pathname = usePathname();
  const totalQuantity =
    data?.success && data.cart ? data.cart.totalQuantity : 0;
  const isCartPage = pathname === "/cart";

  useEffect(() => {
    setCart(data);
  }, [data]);

  return (
    <button
      onClick={() => !isCartPage && openModal("cart", null)}
      disabled={isCartPage}
      className="relative flex items-center justify-center"
    >
      <span className="sr-only">{isCartPage ? "Cart" : "Go to cart"}</span>
      <ShoppingCart aria-hidden className="size-5 text-primary" />
      {totalQuantity > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-stone-800 text-[10px] font-medium text-white">
          {totalQuantity > 99 ? "99+" : totalQuantity}
        </span>
      )}
    </button>
  );
}
