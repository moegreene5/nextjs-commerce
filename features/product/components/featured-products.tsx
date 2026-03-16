import { CACHE_TAGS } from "@/lib/cache-tags";
import { cacheTag } from "next/cache";
import { getFeaturedProducts } from "../product-queries";
import SegmentSection from "./segment-section";

export default async function FeaturedProducts() {
  "use cache";
  cacheTag(CACHE_TAGS.featuredProducts);

  const featuredProducts = await getFeaturedProducts();

  return (
    <SegmentSection
      viewAllHref="/collections/shop-all?featured=true"
      title="Featured Products"
      products={featuredProducts}
    />
  );
}
