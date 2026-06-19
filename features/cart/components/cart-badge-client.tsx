"use client";

import { openModal } from "@/store/modal";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { cartQueryOptions } from "../queries";

export default function CartBadgeClient() {
  const pathname = usePathname();
  const data = useQuery(cartQueryOptions());
  const totalQuantity = data.data?.totalQuantity ?? 0;
  const isCartPage = pathname === "/cart";

  const handleIntent = () => {
    import("@/components/modals/cart-modal");
  };

  return (
    <button
      onClick={() => !isCartPage && openModal("cart", null)}
      disabled={isCartPage}
      onMouseEnter={handleIntent}
      onTouchStart={handleIntent}
      onFocus={handleIntent}
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
