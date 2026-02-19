import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cacheTag } from "next/cache";
import Image from "next/image";
import { getProduct } from "../product-queries";
import { ShareLinks } from "./share-links";

export default async function ProductDetails({
  productId,
}: {
  productId: string;
}) {
  "use cache";

  cacheTag(`product-${productId}`);

  const product = await getProduct(productId);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const shareUrl = `${siteUrl}/product/${productId}`;

  return (
    <div className="grid md:grid-cols-2 gap-4 lg:gap-12 xl:gap-16">
      <Carousel
        className="lg:order-2"
        opts={{
          skipSnaps: true,
          slidesToScroll: 1,
          containScroll: "keepSnaps",
          loop: true,
          align: "start",
        }}
      >
        <CarouselNext className="border-none bg-transparent right-0 z-10" />
        <CarouselPrevious className="border-none bg-transparent left-0 z-10" />
        <CarouselContent>
          {[...product.image, ...product.image].map((item, index) => (
            <CarouselItem className="mx-auto" key={`${item}-${index}`}>
              <div className="w-full aspect-square lg:h-svh relative">
                <Image
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={item}
                  alt="product-image"
                  className="object-contain"
                  fill
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots className="absolute bottom-[15%] left-1/2 -translate-x-1/2 rounded-full" />
      </Carousel>

      <div className="xl:pr-8 flex flex-col gap-4 lg:order-1">
        <div>
          <h1 className="font-bold text-2xl md:text-3xl">{product.brand}</h1>
          <p className="font-medium text-base md:text-lg text-gray-700 mt-1">
            {product.name}
          </p>
        </div>

        <div className="mt-2">
          <span className="inline-block px-3 py-1 bg-black text-white rounded-md text-sm font-medium">
            {product.size}
          </span>
        </div>

        <div className="mt-2">
          <span className="text-xl font-semibold text-gray-900 font-geologica">
            ${product.price}
          </span>
        </div>

        <ShareLinks
          url={shareUrl}
          title={`${product.brand} - ${product.name}`}
        />

        <div className="my-4 h-px bg-gray-300" />

        <p className="text-sm md:text-base text-gray-800 max-w-[65ch] leading-relaxed mb-6">
          {product.description}
        </p>

        <Button className="w-full rounded-none py-2.5 px-5 h-auto uppercase tracking-widest hover:bg-white border border-primary hover:text-black">
          Add To Cart
        </Button>

        <div className="h-20" />
      </div>
    </div>
  );
}
