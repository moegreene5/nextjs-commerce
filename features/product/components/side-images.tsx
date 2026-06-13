import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ProductImage } from "@/entities/product";
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
    <div className={className}>
      <Carousel
        className="my-4 md:my-0 md:sticky md:top-18"
        orientation="vertical"
        setApi={setThumbsApi}
        opts={{ skipSnaps: true, dragFree: true }}
      >
        <CarouselContent className="mt-0 w-full flex-row md:flex-col gap-4 md:gap-0">
          {images.map((image, index) => (
            <CarouselItem
              className="cursor-pointer basis-auto pl-0"
              key={"thumbnail_" + image.url + index}
              onClick={() => onThumbClick(index)}
            >
              <div className="relative p-0.5">
                <div className="relative h-22 w-22 overflow-hidden rounded-md bg-zinc-100">
                  <Image
                    alt={`Product image ${index + 1}`}
                    src={image.url || `/default-product-image.svg`}
                    fill
                    sizes="88px"
                    className="object-cover"
                    loading="eager"
                  />

                  {index === current && (
                    <div className="absolute inset-0 rounded-md border-2 border-black pointer-events-none z-10" />
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
