import { ProductFilters } from "@/entities/product";
import { PAGE_SIZE } from "@/features/product/search-params";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { getProducts } from "./product-actions";

export const productFeedQueryOptions = (filters: ProductFilters) =>
  infiniteQueryOptions({
    queryKey: ["products-feed", filters] as const,
    queryFn: async ({ pageParam }) =>
      await getProducts({
        ...filters,
        limit: PAGE_SIZE,
        startAfterDocId: pageParam || undefined,
      }),
    select: (data) => ({
      pages: data.pages.flatMap((page) => page.products),
      pageParams: data.pageParams,
      filteredCount: data.pages[0]?.filteredCount ?? 0,
    }),
    initialPageParam: undefined as string | null | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDocId : undefined;
    },
  });
