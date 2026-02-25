import ProductCard from "@/components/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Product } from "@/entities/product";
import { cn } from "@/utils/cn";

type SegmentSectionProps = {
  title: string;
  products: Product[];
  className?: string;
};

export default function SegmentSection({
  title,
  products,
  className,
}: SegmentSectionProps) {
  if (!products || products.length === 0) return null;

  return (
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
      className={cn("mt-6", className)}
    >
      <div className="flex items-center justify-between gap-4 px-page mb-4">
        <h2 className="text-2xl xl:text-3xl">The {title}</h2>
        <div className="flex gap-2">
          <CarouselPrevious
            variant="outline"
            className="hidden static lg:flex bg-black text-white hover:text-white"
          />
          <CarouselNext
            variant="outline"
            className="hidden static lg:flex bg-black text-white hover:text-white"
          />
        </div>
      </div>

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
  );
}
