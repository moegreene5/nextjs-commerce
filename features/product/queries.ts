import { GetProductsResult, ProductFilters } from "@/entities/product";
import { PAGE_SIZE } from "@/features/product/search-params";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { getProductAction } from "./product-actions";

export const productFeedQueryOptions = (filters: ProductFilters) =>
  infiniteQueryOptions({
    queryKey: ["products-feed", filters] as const,
    queryFn: async ({ pageParam }): Promise<GetProductsResult> => {
      if (typeof window === "undefined") {
        return getProductAction({
          ...filters,
          limit: PAGE_SIZE,
          startAfterDocId: pageParam ?? undefined,
        });
      }

      const searchParams = new URLSearchParams();

      if (filters.brand) {
        const brands = Array.isArray(filters.brand)
          ? filters.brand
          : [filters.brand];
        brands.forEach((b) => searchParams.append("brand", b));
      }
      if (filters.categoryId) {
        const categories = Array.isArray(filters.categoryId)
          ? filters.categoryId
          : [filters.categoryId];
        categories.forEach((c) => searchParams.append("category", c));
      }
      if (filters.isFeatured) searchParams.set("featured", "true");
      if (filters.isBestSeller) searchParams.set("bestseller", "true");
      if (filters.sortBy) searchParams.set("sortBy", filters.sortBy);
      if (filters.sortDir) searchParams.set("sortDir", filters.sortDir);
      if (pageParam) searchParams.set("startAfterDocId", pageParam);

      const response = await fetch(`/api/products?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch product feed: ${response.statusText}`);
      }

      return response.json();
    },
    select: (data) => ({
      pages: data.pages.flatMap((page) => page.products),
      pageParams: data.pageParams,
      filteredCount: data.pages[0]?.filteredCount ?? 0,
    }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDocId : undefined;
    },
    initialPageParam: undefined as string | null | undefined,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
