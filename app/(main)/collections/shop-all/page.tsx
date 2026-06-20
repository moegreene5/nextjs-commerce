import { Container } from "@/components/ui/container";
import { ProductFeed } from "@/features/product/components/filters/feed";
import {
  FilterBar,
  FilterBarSkeleton,
} from "@/features/product/components/filters/filter-bar";
import { HitsSkeleton } from "@/features/product/components/filters/hits-section";
import { productFeedQueryOptions } from "@/features/product/queries";
import {
  buildFilters,
  parseSearchParams,
} from "@/features/product/search-params";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Metadata } from "next";
import { SearchParams } from "next/dist/server/request/search-params";
import Image from "next/image";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "All Products | Shop All",
};

export default function Page({
  searchParams,
}: PageProps<"/collections/shop-all">) {
  return (
    <main className="min-h-[calc(100svh-80px)]">
      <div className="relative w-full grid md:grid-cols-2 xl:grid-cols-[12fr_11fr] bg-[#FDF3C0]">
        <div className="relative w-full h-64 md:h-98 md:order-2">
          <Image
            fill
            alt="banner-image"
            src="/images/com-9.jpg"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={true}
          />
        </div>
        <div className="flex flex-col justify-center px-page gap-4 py-10 md:py-0 md:order-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-black">
            Shop All
          </h1>
          <p className="text-[#5C4A00] text-sm sm:text-base font-semibold">
            Discover our collection of science-backed essences and serums
            designed to hydrate, clarify, and restore your skin's natural
            balance.
          </p>
        </div>
      </div>

      <Container className="py-6 md:py-8">
        <div className="flex flex-col gap-8">
          <Suspense fallback={<FilterBarSkeleton />}>
            <FilterBar />
          </Suspense>
          <Suspense fallback={<HitsSkeleton />}>
            <AllProducts searchParams={searchParams} />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}

interface Props {
  searchParams: Promise<SearchParams>;
}

async function AllProducts({ searchParams }: Props) {
  const sParams = await searchParams;
  const { brand, category, sort, featured, bestseller } =
    parseSearchParams(sParams);
  const filters = buildFilters({ brand, category, sort, featured, bestseller });

  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery(productFeedQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductFeed filters={filters} />
    </HydrationBoundary>
  );
}
