"use client";

import { cart } from "@/utils/query-keys";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";

export default function CartBadgeClient() {
  const { data } = useSuspenseQuery({
    ...cart(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const totalItems = data?.success && data.cart ? data.cart.totalItems : 0;

  return (
    <button className="relative flex items-center justify-center">
      <span className="sr-only">Go to cart</span>
      <ShoppingCart aria-hidden className="size-5 text-primary" />
      {totalItems > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-stone-800 text-[10px] font-medium text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
