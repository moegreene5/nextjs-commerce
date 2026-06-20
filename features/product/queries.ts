import { infiniteQueryOptions } from "@tanstack/react-query";
import { ProductFilters } from "@/entities/product";
import { PAGE_SIZE } from "@/features/product/search-params";
import { getProducts } from "./product-actions";

export const productFeedQueryOptions = (filters: ProductFilters) =>
  infiniteQueryOptions({
    queryKey: ["products-feed", filters] as const,

    queryFn: async ({ pageParam }) => {
      return await getProducts({
        ...filters,
        limit: PAGE_SIZE,
        startAfterDocId: pageParam || undefined,
      });
    },

    initialPageParam: undefined as string | null | undefined,

    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDocId : undefined;
    },
  });
