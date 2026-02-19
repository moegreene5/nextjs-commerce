import { Product } from "@/entities/product";
import { Button } from "../../../components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProductCard from "@/components/product-card";

type SegmentSectionProps = {
  title: string;
  sliderName: string;
  products: Product[];
  showButton?: boolean;
};

export default function SegmentSection({
  title,
  sliderName,
  products,
  showButton = false,
}: SegmentSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <div>
      <div className=" mt-6">
        <Carousel
          opts={{
            skipSnaps: true,
            containScroll: "keepSnaps",
            dragFree: true,
            slidesToScroll: "auto",
            breakpoints: {
              "(min-width: 1024px)": { slidesToScroll: 3 },
            },
          }}
        >
          <div className="flex justify-center w-full items-center py-2 border rounded-[40px] md:rounded-none border-gray-700 md:border-0 relative">
            <h2 className="text-primary font-normal flex items-center text-base x:text-lg md:text-3xl lg:text-4xl md:px-4 relative bg-white z-10">
              {title}
            </h2>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full border-0 md:border-t-2 md:border-gray-300"></div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <CarouselPrevious
              variant="outline"
              className="hidden static lg:flex hover:text-black border-none"
            />
            <CarouselNext
              variant="outline"
              className="hidden static lg:flex hover:text-black border-none"
            />
          </div>

          <CarouselContent className="ml-2.5 sm:ml-4 md:ml-7">
            {products.map((product) => (
              <CarouselItem
                className="basis-[50%] x410:basis-[45%] sm:basis-[40%] lg:basis-[25%] xl:basis-[20%] p-0"
                key={product.id}
              >
                <ProductCard classname="mr-4" product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <div className="flex justify-center pb-10 pt-8">
        <Button>View All</Button>
      </div>
    </div>
  );
}
