"use client";

import { ProductCard as ProductCardType } from "@/entities/product";
import { addToCart } from "@/features/cart/cart-actions";
import { useCartAlertStore } from "@/store/add-product-store";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format-price";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

export interface ProductCardProps
  extends Pick<
    ProductCardType,
    | "name"
    | "images"
    | "id"
    | "variants"
    | "brand"
    | "slug"
    | "sale"
    | "isOutOfStock"
    | "lowestPrice"
    | "lowestOriginalPrice"
    | "isOnSale"
    | "hasMultipleVariants"
  > {
  className?: string;
  showAddToCart?: boolean;
}

const ProductCard = ({
  className,
  name,
  id,
  images,
  variants,
  brand,
  slug,
  sale,
  isOutOfStock,
  lowestPrice,
  lowestOriginalPrice,
  isOnSale,
  hasMultipleVariants,
  showAddToCart = true,
}: ProductCardProps) => {
  const [isPending, startTransition] = useTransition();
  const { show } = useCartAlertStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const firstVariant = variants[0];
      const result = await addToCart({
        productId: id,
        variantId: firstVariant.id,
        quantity: 1,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      show({
        id,
        name,
        image: images[0]?.url,
        slug,
        variantSize: firstVariant.size,
        displayPrice: firstVariant.displayPrice,
        originalPrice: firstVariant.price,
        isOnSale,
      });
    });
  };

  return (
    <article
      className={cn("group/card relative h-full flex flex-col", className)}
    >
      <Link href={`/product/${slug}`} className="group/image block">
        <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-50">
          <Image
            src={images[0]?.url}
            alt={name}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-opacity duration-700",
              images[1]
                ? "group-hover/image:opacity-0"
                : "transition-transform duration-700 group-hover/image:scale-105",
            )}
          />

          {images[1] && (
            <Image
              src={images[1].url}
              alt={`${name} - alternate view`}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 group-hover/image:opacity-100 transition-opacity duration-700"
            />
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Sold Out
              </span>
            </div>
          )}

          {isOnSale && !isOutOfStock && (
            <div className="absolute left-0 top-0 bg-black px-2 py-1">
              <span className="text-[9px] uppercase tracking-[0.15em] text-white">
                {sale?.label ?? "Sale"}
              </span>
            </div>
          )}
        </div>
      </Link>

      <Link href={`/product/${slug}`} className="my-3 flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
          {brand}
        </span>
        <p className="text-[13px] leading-snug text-black transition-opacity hover:opacity-60">
          {name}
        </p>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[13px]",
              isOnSale ? "text-black" : "text-neutral-700",
            )}
          >
            {hasMultipleVariants && !isOnSale
              ? `From ${formatPrice(lowestPrice)}`
              : formatPrice(lowestPrice)}
          </span>
          {isOnSale && (
            <span className="text-[12px] text-neutral-400 line-through">
              {formatPrice(lowestOriginalPrice)}
            </span>
          )}
        </div>
      </Link>

      {showAddToCart &&
        (isOutOfStock ? (
          <button
            disabled
            className="mt-auto w-full border border-neutral-200 py-2.5 text-[10px] uppercase tracking-[0.18em] text-neutral-300 cursor-default"
          >
            Unavailable
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={isPending}
            className={cn(
              "mt-auto w-full border border-black py-2.5 text-[10px] uppercase tracking-[0.18em] hover:bg-black hover:text-white font-medium",
              "transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden relative",
              isPending && "opacity-60 cursor-default",
            )}
          >
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-300",
                isPending
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4",
              )}
            >
              <span className="flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                <span className="size-1 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                <span className="size-1 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
              </span>
            </span>
            <span
              className={cn(
                "flex items-center justify-center gap-1.5 transition-all duration-300",
                isPending
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0",
              )}
            >
              Add to Cart
            </span>
          </button>
        ))}
    </article>
  );
};

export default ProductCard;

export const ProductCardSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="aspect-3/4 w-full bg-neutral-100 " />
    <Skeleton className="flex flex-col gap-1.5">
      <Skeleton className="h-2 w-1/3 bg-neutral-100  rounded" />
      <Skeleton className="h-3 w-3/4 bg-neutral-100  rounded" />
      <Skeleton className="h-3 w-1/4 bg-neutral-100  rounded" />
    </Skeleton>
    <Skeleton className="h-9 w-full bg-neutral-100 " />
  </div>
);
