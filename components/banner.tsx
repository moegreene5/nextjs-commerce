import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from "./ui/carousel";

const Banner = () => {
  return (
    <Carousel opts={{ watchDrag: false }} className="w-full">
      <CarouselContent>
        <CarouselItem>
          <div className="relative w-full min-h-[calc(100svh-80px)] grid md:grid-cols-2">
            <div className="bg-[#F5F0E8] flex flex-col justify-center px-page gap-6 py-16 md:py-0">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-[#1A1209]">
                Clean Ingredients, <br /> Real Results
              </h1>
              <p className="text-[#6B5A3E] text-lg max-w-sm">
                Science-backed essences and serums that deeply hydrate, clarify
                and restore your skin's natural balance.
              </p>
              <div className="flex gap-4">
                <a
                  href="/products"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#1A1209] text-white font-semibold hover:opacity-80 transition-opacity"
                >
                  Shop Now
                </a>
                <a
                  href="/products"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-[#1A1209] text-[#1A1209] font-semibold hover:bg-[#1A1209] hover:text-white transition-colors"
                >
                  Explore
                </a>
              </div>
            </div>

            <div className="relative w-full h-88 md:h-auto">
              <Image
                fill
                alt="banner-image"
                src="/images/com-6.webp"
                className="object-cover object-center"
                priority
              />
            </div>
          </div>
        </CarouselItem>

        <CarouselItem>
          <div className="relative w-full md:min-h-[calc(100svh-80px)] grid md:grid-cols-2">
            <div className="bg-[#E8E6F0] flex flex-col justify-center px-page gap-6 py-16 md:py-0">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-[#1E1E3A]">
                Skincare <br /> Made For You
              </h1>
              <p className="text-[#4A4A6A] text-lg max-w-sm">
                Personalised formulas crafted for your unique skin — cleanse,
                treat, moisturise.
              </p>
              <div className="flex gap-4">
                <a
                  href="/products"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#1E1E3A] text-white font-semibold hover:opacity-80 transition-opacity"
                >
                  Shop Now
                </a>
                <a
                  href="/products"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-[#1E1E3A] text-[#1E1E3A] font-semibold hover:bg-[#1E1E3A] hover:text-white transition-colors"
                >
                  Explore
                </a>
              </div>
            </div>

            <div className="relative w-full h-88 md:h-auto">
              <Image
                fill
                alt="banner-image"
                src="/images/com-4.webp"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </CarouselItem>
      </CarouselContent>

      <CarouselDots className="absolute bottom-4 left-1/2 -translate-x-1/2" />
    </Carousel>
  );
};

export default Banner;
