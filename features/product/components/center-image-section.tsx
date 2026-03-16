import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import {
  CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { cn } from "@/utils/cn";
import { ProductImage } from "@/entities/product";

type CenterSectionProps = {
  images: ProductImage[];
  setApi: Dispatch<SetStateAction<CarouselApi>>;
  className?: string;
};

export const CenterSection = ({
  className,
  images,
  setApi,
}: CenterSectionProps) => {
  const hasOnlyOneImage = images.length <= 1;

  return (
    <div className={cn("flex flex-col rounded-t-lg", className)}>
      <div className="md:sticky md:top-18">
        <Carousel
          opts={{ loop: true }}
          className="[&>div]:rounded-lg"
          setApi={setApi}
        >
          <CarouselContent
            className={cn("rounded-lg", hasOnlyOneImage ? "ml-0" : "")}
          >
            {images.map((image, index) => (
              <CarouselItem
                className={cn(
                  "relative aspect-square rounded-lg",
                  hasOnlyOneImage && "pl-0",
                )}
                key={image.url + index}
              >
                <Image
                  alt={`Product image ${index + 1}`}
                  src={image.url}
                  fill
                  priority={image.isPrimary}
                  unoptimized
                  sizes="(max-width: 668px) 100vw, 50vw"
                  style={{ objectFit: "contain" }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {!hasOnlyOneImage && (
            <>
              <CarouselPrevious className="left-0 hidden md:flex" />
              <CarouselNext className="right-0 hidden md:flex" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
};
