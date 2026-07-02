import ProductCard, { ProductCardSkeleton } from "@/components/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { cacheTag } from "next/cache";
import { getRelatedProducts } from "../product-queries";

export default async function RelatedProducts({ slug }: { slug: string }) {
  "use cache";
  cacheTag(CACHE_TAGS.relatedProducts);

  const relatedProducts = await getRelatedProducts(slug);

  if (!relatedProducts.length) return null;

  return (
    <div className="my-8 md:my-16 mb-16">
      <div className="px-page">
        <h2 className="text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
          You might also like
        </h2>
      </div>
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
              className="basis-[50%] x410:basis-[45%] sm:basis-[40%] lg:basis-[25%] p-0 pr-4"
              key={product.id}
            >
              <ProductCard
                showAddToCart={false}
                key={product.id}
                id={product.id}
                slug={product.slug}
                name={product.name}
                brand={product.brand}
                isOnSale={product.isOnSale}
                isOutOfStock={product.isOutOfStock}
                lowestPrice={product.lowestPrice}
                lowestOriginalPrice={product.lowestOriginalPrice}
                hasMultipleVariants={product.hasMultipleVariants}
                images={product.images}
                variants={product.variants}
                sale={product.sale}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden px-page">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="basis-[50%] x410:basis-[45%] sm:basis-[40%] lg:basis-[25%] shrink-0"
        >
          <ProductCardSkeleton key={i} />
        </div>
      ))}
    </div>
  );
}
