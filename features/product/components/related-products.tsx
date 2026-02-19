import ProductCard from "@/components/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { getRelatedProducts } from "../product-queries";
import { cn } from "@/utils/cn";

type Props = {
  productId: string;
};

export default async function RelatedProducts({ productId }: Props) {
  const relatedProducts = await getRelatedProducts(productId);

  return (
    <Carousel
      opts={{
        skipSnaps: true,
        containScroll: "keepSnaps",
        dragFree: true,
        slidesToScroll: "auto",
        loop: true,
        align: "start",
      }}
    >
      <div className="flex gap-2 justify-end">
        <CarouselPrevious className="hidden static lg:flex" />
        <CarouselNext className="hidden static lg:flex" />
      </div>

      <CarouselContent>
        {relatedProducts.map((product) => (
          <CarouselItem
            className="basis-[50%] x410:basis-[45%] sm:basis-[40%] lg:basis-[25%]"
            key={product.id}
          >
            <ProductCard product={product} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <div className="flex gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="basis-[50%] x410:basis-[45%] sm:basis-[40%] lg:basis-[25%] shrink-0"
        >
          <article
            className={cn(
              "h-full bg-white p-2 md:p-3 xl:p-3.75",
              "border border-[rgb(222,222,222)]",
              "max-w-87.5 overflow-hidden",
            )}
          >
            <div className="py-1">
              <div className="w-full max-w-[288px] mx-auto aspect-[4/3.8] relative">
                <Skeleton className="absolute inset-0 rounded-md bg-accent" />
              </div>
            </div>

            <div className="pt-2 sm:pt-4 flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4 bg-accent" />
              <Skeleton className="h-4 w-1/3 bg-accent" />
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
