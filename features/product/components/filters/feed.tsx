"use client";

import { Button } from "@/components/ui/button";
import { ProductCard, ProductFilters } from "@/entities/product";
import { useEffect, useState, useTransition } from "react";
import { fetchMoreProducts } from "../../product-actions";
import { HitsSection } from "./hits-section";

interface Props {
  initialProducts: ProductCard[];
  initialCursor: string | null;
  hasMore: boolean;
  filteredCount: number;
  filters: ProductFilters;
}

export function ProductFeed({
  initialProducts,
  initialCursor,
  hasMore: initialHasMore,
  filteredCount,
  filters,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setProducts(initialProducts);
    setCursor(initialCursor);
    setHasMore(initialHasMore);
  }, [initialProducts, initialCursor, initialHasMore]);

  function handleLoadMore() {
    if (!cursor || isPending) return;
    startTransition(async () => {
      const result = await fetchMoreProducts(filters, cursor);
      setProducts((prev) => [...prev, ...result.products]);
      setCursor(result.lastDocId);
      setHasMore(result.hasMore);
    });
  }

  return (
    <>
      <HitsSection hits={products} />
      {hasMore && (
        <div className="flex flex-col items-center gap-3 my-4">
          <p className="text-sm text-muted-foreground my-2">
            Showing {products.length} of {filteredCount}
          </p>
          <Button
            onClick={handleLoadMore}
            disabled={isPending}
            className="rounded-none border-black uppercase h-12 px-12 tracking-widest hover:bg-white hover:text-black"
          >
            {isPending ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </>
  );
}
