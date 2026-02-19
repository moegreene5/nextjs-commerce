"use client";

import { Product } from "@/entities/product";
import { cn } from "@/utils/cn";
import Image from "next/image";
import Link from "next/link";
import { useState, ViewTransition } from "react";
import { CgEye } from "react-icons/cg";

interface Props {
  classname?: string;
  product: Product;
}

const ProductCard = ({ classname, product }: Props) => {
  const { image, id, price, name } = product;
  const [transformOrigin, setTransformOrigin] =
    useState<string>("center center");

  const handleMouseMove = (event: React.MouseEvent<HTMLImageElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    setTransformOrigin(`${xPercent}% ${yPercent}%`);
  };

  const handleMouseLeave = () => {
    setTransformOrigin("center center");
  };

  return (
    <ViewTransition name={`product-${id}`}>
      <article
        className={cn(
          "h-full bg-[rgb(255,255,255)] p-2 md:p-3 xl:p-3.75 border border-[rgb(222,222,222)] max-w-87.5 overflow-hidden",
          classname,
        )}
      >
        <Link href={`/product/${id}`}>
          <div className="py-1">
            <div className="w-full max-w-[288px] mx-auto max-h-full bg-white flex items-center justify-center aspect-[4/3.8] overflow-hidden relative cursor-pointer">
              <Image
                fill
                src={image[0]}
                alt={`product image ${name}`}
                className="object-contain overflow-hidden transition-transform duration-2500 ease-in-out md:hover:scale-125"
                style={{ transformOrigin }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 280px"
              />
            </div>
          </div>
        </Link>
        <div className="pt-2 sm:pt-4 bg-white flex flex-col gap-2">
          <Link
            className="font-semibold text-borderColor truncate-multiline tracking-wide text-xs md:text-sm overflow-hidden"
            href={`/products/${id}`}
          >
            {name}
          </Link>
          <div className="w-full pt-2 pb-2 font-medium text-balance text-left text-xs flex items-center justify-between gap-4 flex-wrap transition-colors duration-300 ease-in-out">
            <div className="flex gap-2 items-center flex-nowrap ml-auto">
              <button
                title="Quick View"
                aria-label="Quick View"
                className="hidden xlli:block"
              >
                <CgEye className="text-primary text-sm md:text-base hover:text-[#050505] transition-all duration-300" />
              </button>
            </div>
          </div>
        </div>
      </article>
    </ViewTransition>
  );
};

export default ProductCard;
