"use client";

import { Button } from "@/components/ui/button";
import { CartItem } from "@/entities/cart";
import {
  incrementOrDecreaseQuantity,
  removeItemFromCart,
} from "@/features/cart/cart-actions";
import { useModalStore } from "@/store/modal";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format-price";
import { Minus, Plus, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
  item: CartItem;
  isCartPage?: boolean;
};

export default function CartItemCard({ item, isCartPage = false }: Props) {
  const closeModal = useModalStore((s) => s.closeModal);

  const [isRemoving, startRemoveTransition] = useTransition();
  const [isIncrementing, startIncrementTransition] = useTransition();
  const [isDecrementing, startDecrementTransition] = useTransition();

  const isPending = isRemoving || isIncrementing || isDecrementing;

  const saleActive =
    item.priceChange.changed && item.priceChange.direction === "down";

  const handleRemove = () => {
    startRemoveTransition(async () => {
      const result = await removeItemFromCart({ variantId: item.variantId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
    });
  };

  const handleIncrement = () => {
    startIncrementTransition(async () => {
      const result = await incrementOrDecreaseQuantity({
        productId: item.productId,
        variantId: item.variantId,
        type: "increase",
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
    });
  };

  const handleDecrement = () => {
    startDecrementTransition(async () => {
      const result = await incrementOrDecreaseQuantity({
        productId: item.productId,
        variantId: item.variantId,
        type: "decrease",
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-4 border-b border-border last:border-none transition-opacity duration-200",
        isPending && "opacity-60 pointer-events-none",
      )}
    >
      <Link onClick={() => closeModal("cart")} href={`/product/${item.slug}`}>
        <div className="h-33 w-26.5 relative">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain"
            sizes="105px"
          />
        </div>
      </Link>

      <div
        className={cn(
          "flex flex-1 flex-col min-w-0 gap-12",
          isCartPage && "gap-14",
        )}
      >
        <div className="flex items-start justify-between gap-5">
          <div className="flex flex-col gap-0.5 min-w-0">
            <Link
              onClick={() => closeModal("cart")}
              href={`/product/${item.slug}`}
              className="text-xs md:text-sm text-stone-800 leading-snug hover:text-stone-500 transition-colors line-clamp-2 font-bold"
            >
              {item.name}
            </Link>
            <span className="text-[10px] text-stone-400 uppercase tracking-widest font-geologica">
              {item.size}
            </span>
          </div>

          <button
            onClick={handleRemove}
            disabled={isPending}
            className="shrink-0 text-primary hover:text-primary/75 disabled:opacity-30 transition-colors"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-5">
          <div className="flex flex-col items-start">
            {isPending ? (
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                <span className="size-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold font-geologica text-stone-800 tabular-nums">
                    {formatPrice(item.currentPrice * item.quantity)}
                  </span>
                  {saleActive && item.priceChange.changed && (
                    <span className="text-[10px] text-stone-400 line-through tabular-nums">
                      {formatPrice(
                        item.priceChange.previousPrice * item.quantity,
                      )}
                    </span>
                  )}
                </div>

                {item.priceChange.changed && (
                  <span
                    className={cn(
                      "text-[10px] tabular-nums",
                      item.priceChange.direction === "up"
                        ? "text-red-400"
                        : "text-green-500",
                    )}
                  >
                    {item.priceChange.direction === "up" ? "↑" : "↓"}{" "}
                    {item.priceChange.percentage.toFixed(0)}% since added
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 border border-primary rounded-full px-1 py-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 rounded-full"
              onClick={handleDecrement}
              disabled={isPending}
              aria-label="Decrease quantity"
            >
              <Minus className="size-4 font-semibold" />
            </Button>

            <span className="text-xs text-black font-medium w-4 text-center tabular-nums">
              {item.quantity}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 rounded-full"
              onClick={handleIncrement}
              disabled={isPending}
              aria-label="Increase quantity"
            >
              <Plus className="size-4 font-semibold" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
