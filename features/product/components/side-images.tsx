import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { ProductImage } from "@/entities/product";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { type Dispatch, type SetStateAction, useCallback } from "react";

type SideImagesProps = {
  images: ProductImage[];
  api: CarouselApi;
  setThumbsApi: Dispatch<SetStateAction<CarouselApi>>;
  current: number;
  className?: string;
};

export const SideImages = ({
  className,
  images,
  api,
  setThumbsApi,
  current,
}: SideImagesProps) => {
  const onThumbClick = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  return (
    <div className={cn("", className)}>
      <Carousel
        className="my-4 md:my-0 md:sticky md:top-18"
        orientation="vertical"
        aria-label="Product image thumbnails"
        setApi={setThumbsApi}
        opts={{
          skipSnaps: true,
          watchDrag: false,
        }}
      >
        <CarouselContent className="mt-0 w-full flex-row md:flex-col justify-center gap-4">
          {images.map((image, index) => (
            <div
              role="button"
              tabIndex={0}
              aria-label={`View product image ${index + 1}`}
              className={cn(
                "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black",
                index === current && "border-2 border-black rounded-lg",
              )}
              key={"thumbnail_" + image.url + index}
              onClick={() => onThumbClick(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onThumbClick(index);
                }
              }}
            >
              <Image
                alt={`Product image ${index + 1}`}
                src={image.url || `/default-product-image.svg`}
                width={100}
                height={100}
                sizes="100px"
                className="object-contain rounded-lg"
                priority={true}
              />
            </div>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
