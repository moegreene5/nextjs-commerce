import { CACHE_TAGS } from "@/lib/cache-tags";
import { cacheTag } from "next/cache";
import { getBestSellers } from "../product-queries";
import SegmentSection from "./segment-section";

export default async function BestSellers() {
  "use cache";
  cacheTag(CACHE_TAGS.bestSellers);

  const bestSellers = await getBestSellers();

  return (
    <SegmentSection
      viewAllHref="/collections/shop-all?bestseller=true"
      title="Best Sellers"
      products={bestSellers}
    />
  );
}
