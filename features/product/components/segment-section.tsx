import ProductCard from "@/components/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard as ProductCardType } from "@/entities/product";
import { cn } from "@/utils/cn";
import { ChevronRight } from "lucide-react";
import { Route } from "next";
import Link from "next/link";

type SegmentSectionProps = {
  title: string;
  products: ProductCardType[];
  className?: string;
  viewAllHref?: Route;
};

export default function SegmentSection({
  title,
  products,
  className,
  viewAllHref,
}: SegmentSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 px-page mb-6">
        <h2 className="text-2xl xl:text-3xl font-semibold font-geologica">
          {title}
        </h2>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 shrink-0"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <Carousel
        opts={{
          skipSnaps: true,
          containScroll: "trimSnaps",
          dragFree: true,
          align: "start",
          slidesToScroll: 2,
          breakpoints: {
            "(min-width: 1024px)": { slidesToScroll: 3 },
          },
        }}
        className={cn("mt-6 group/carousel", className)}
      >
        <CarouselPrevious className="left-6 lg:flex hidden opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 transition-all duration-200 z-20 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:scale-110 border-gray-200" />
        <CarouselNext className="right-6 lg:flex hidden opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 transition-all duration-200 z-20 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:scale-110 border-gray-200" />

        <div className="hidden lg:block absolute left-0 top-0 h-full w-16 bg-linear-to-r from-white/60 to-transparent z-10 pointer-events-none" />
        <div className="hidden lg:block absolute right-0 top-0 h-full w-16 bg-linear-to-l from-white/60 to-transparent z-10 pointer-events-none" />

        <CarouselContent className="mx-page gap-2 sm:gap-4 md:gap-6 xl:gap-8">
          {products.map((product) => (
            <CarouselItem
              className="basis-[49%] sm:basis-[40%] lg:basis-[27%] p-0"
              key={product.id}
            >
              <ProductCard {...product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
