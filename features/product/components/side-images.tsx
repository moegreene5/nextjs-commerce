import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { type Dispatch, type SetStateAction, useCallback } from "react";

type SideImagesProps = {
  images: string[];
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
        className="my-4 md:my-0 md:sticky md:top-0"
        orientation="vertical"
        setApi={setThumbsApi}
        opts={{ skipSnaps: true, watchDrag: false }}
      >
        <CarouselContent className="mt-0 w-full flex-row justify-center gap-4 md:flex-col">
          {images.map((image, index) => (
            <div
              className={cn(
                "cursor-pointer",
                index === current && "border-2 border-black",
              )}
              key={"thumbnail_" + image + index}
              onClick={() => onThumbClick(index)}
            >
              <Image
                alt={`Product image ${index + 1}`}
                src={image || `/default-product-image.svg`}
                width={100}
                height={100}
                sizes="100px"
              />
            </div>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
