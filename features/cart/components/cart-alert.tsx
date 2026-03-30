"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCartAlertStore } from "@/store/add-product-store";
import { useModalStore } from "@/store/modal";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format-price";
import Image from "next/image";
import Link from "next/link";

type Props = {
  className?: string;
};

export function CartAlert({ className }: Props) {
  const { product, clear } = useCartAlertStore();
  const openModal = useModalStore((s) => s.openModal);

  if (!product) return null;

  return (
    <Alert
      className={cn(
        "border-border absolute right-[2%] top-22 z-50 w-[90vw] max-w-102.5 min-w-70 text-black border bg-[rgb(225,225,225,0.5)]  backdrop-blur-2xl transition-all md:top-18 md:min-w-87.5",
        className,
      )}
    >
      <AlertTitle className="text-nowrap text-sm font-bold">
        Product has been added to the cart!
      </AlertTitle>
      <AlertDescription className="mt-6 flex flex-col min-h-24">
        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12 shrink-0">
              <Image
                fill
                alt={product.name}
                className="z-0 select-none rounded object-cover transition-transform group-hover:scale-105"
                src={product.image || "/default-product-image.svg"}
                sizes="48px"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold">{product.name}</span>
              <span className="text-xs text-gray-400 font-geologica">
                {product.variantSize}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end font-geologica">
            <span className="text-sm">{formatPrice(product.displayPrice)}</span>
            {product.isOnSale && product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={() => {
              clear();
              openModal("cart", null);
            }}
            variant="outline"
            className="bg-white transition-all hover:scale-105"
          >
            View cart
          </Button>
          <Button
            asChild
            variant="default"
            className="rounded-md px-10 py-4 transition-all hover:scale-105"
          >
            <Link href={"/checkout"}>Checkout</Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
