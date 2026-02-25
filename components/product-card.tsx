"use client";

import { Product } from "@/entities/product";
import { addToCart } from "@/features/cart/cart-actions";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format-price";
import { cartQueryKey } from "@/utils/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

export interface ProductCardProps
  extends Pick<
    Product,
    "name" | "description" | "image" | "id" | "price" | "brand"
  > {
  className?: string;
}

const ProductCard = ({
  className,
  name,
  id,
  image,
  price,
  brand,
}: ProductCardProps) => {
  const hasSecondImage = image.length > 1;
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await addToCart({ productId: id, price, quantity: 1 });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: cartQueryKey });
      toast.success("Added to cart");
    });
  };

  return (
    <article
      className={cn(
        "group flex flex-col h-full overflow-hidden border border-stone-200 hover:border-stone-300 transition-all duration-300",
        className,
      )}
    >
      <div className="relative">
        <Link href={`/product/${id}`}>
          <div className="aspect-square overflow-hidden m-auto">
            <Image
              src={image[0]}
              alt={name}
              fill
              style={{ objectFit: "contain" }}
              className={cn(
                "transition-all duration-700 ease-out",
                hasSecondImage
                  ? "opacity-100 group-hover:opacity-0"
                  : "group-hover:scale-105",
              )}
            />

            {hasSecondImage && (
              <Image
                src={image[1]}
                alt={`${name} - alternate view`}
                fill
                style={{ objectFit: "contain" }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out"
              />
            )}
          </div>
        </Link>

        <div className="hidden lg:block absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
          <button
            onClick={handleAddToCart}
            disabled={isPending}
            className={cn(
              "w-full flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm text-stone-700 text-xs tracking-widest uppercase font-medium py-2.5 px-4 border border-stone-200 transition-colors duration-200",
              isPending
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-white hover:text-stone-900 hover:border-stone-300",
            )}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isPending ? "Adding..." : "Add to cart"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-2 sm:p-4 h-full justify-between">
        <div className="space-y-3">
          <span className="text-[10px] sm:text-xs tracking-widest uppercase text-stone-400 font-medium">
            {brand}
          </span>

          <h3 className="text-stone-800 text-xs sm:text-sm font-semibold leading-snug">
            {name}
          </h3>

          <div className="text-stone-700 text-xs sm:text-sm font-medium font-geologica">
            {formatPrice(price)}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
