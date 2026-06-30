import ProductCard, { ProductCardSkeleton } from "@/components/product-card";
import { ProductCard as T } from "@/entities/product";

interface HitsSectionProps {
  hits: T[];
}

export function HitsSection({ hits }: HitsSectionProps) {
  if (hits.length === 0) {
    return <p>No results for this query</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-y-12 md:gap-x-6 lg:gap-x-8 lg:gap-y-16">
      {hits.map((hit) => (
        <ProductCard
          key={hit.id}
          id={hit.id}
          slug={hit.slug}
          name={hit.name}
          brand={hit.brand}
          isOnSale={hit.isOnSale}
          isOutOfStock={hit.isOutOfStock}
          lowestPrice={hit.lowestPrice}
          lowestOriginalPrice={hit.lowestOriginalPrice}
          hasMultipleVariants={hit.hasMultipleVariants}
          images={hit.images}
          variants={hit.variants}
          sale={hit.sale}
        />
      ))}
    </div>
  );
}

export function HitsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
      {Array.from({ length: 12 }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
