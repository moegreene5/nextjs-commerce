import ProductCard from "@/components/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import { getRelatedProducts } from "../product-queries";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RelatedProducts({ params }: Props) {
  const productId = (await params).id;

  const relatedProducts = await getRelatedProducts(productId);

  return (
    <Carousel
      opts={{
        skipSnaps: true,
        containScroll: "keepSnaps",
        dragFree: true,
        slidesToScroll: "auto",
        align: "start",
      }}
    >
      <div className="flex gap-2 justify-end px-page">
        <CarouselPrevious className="hidden static lg:flex" />
        <CarouselNext className="hidden static lg:flex" />
      </div>

      <CarouselContent className="mx-page">
        {relatedProducts.map((product) => (
          <CarouselItem
            className="basis-[50%] x410:basis-[45%] sm:basis-[40%] lg:basis-[25%]"
            key={product.id}
          >
            <ProductCard {...product} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
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
