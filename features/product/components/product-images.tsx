"use client";

import { CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";
import { CenterSection } from "./center-image-section";
import { SideImages } from "./side-images";

interface ProductImagesProps {
  images: string[];
  initialActiveIndex?: number;
}

export const ProductImages = ({
  images,
  initialActiveIndex = 0,
}: ProductImagesProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [thumbsApi, setThumbsApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(initialActiveIndex);

  useEffect(() => {
    if (!api || !thumbsApi) {
      return;
    }

    if (initialActiveIndex >= 0) {
      api.scrollTo(initialActiveIndex, true);
      thumbsApi.scrollTo(initialActiveIndex, true);
      setCurrent(initialActiveIndex);
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
      thumbsApi.scrollTo(api.selectedScrollSnap());
    });
  }, [api, thumbsApi, initialActiveIndex]);

  useEffect(() => {
    setCurrent(initialActiveIndex);
  }, [initialActiveIndex]);

  return (
    <div className="grid md:grid-cols-6 gap-2.5 md:gap-6">
      <CenterSection
        setApi={setApi}
        images={images}
        className={cn("col-span-5 md:order-2")}
      />

      {images.length > 1 && (
        <SideImages
          setThumbsApi={setThumbsApi}
          current={current}
          api={api}
          images={images}
        />
      )}
    </div>
  );
};
