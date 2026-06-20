"use client";

import { Button } from "@/components/ui/button";
import { ProductFilters } from "@/entities/product";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { productFeedQueryOptions } from "../../queries";
import { HitsSection } from "./hits-section";

interface Props {
  filters: ProductFilters;
}

export function ProductFeed({ filters }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(productFeedQueryOptions(filters));

  const allProducts = data.pages.flatMap((page) => page.products) ?? [];
  const filteredCount = data.pages[0]?.filteredCount ?? 0;

  return (
    <>
      <HitsSection hits={allProducts} />

      {hasNextPage && (
        <div className="flex flex-col items-center gap-3 my-4">
          <p className="text-sm text-muted-foreground my-2">
            Showing {allProducts.length} of {filteredCount}
          </p>
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-none border-black uppercase h-12 px-12 tracking-widest"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </>
  );
}
