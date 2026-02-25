import { Segment } from "@/lib/constants";
import { cacheTag } from "next/cache";
import { getProductsBySegment } from "../product-queries";
import SegmentSection from "./segment-section";

type Props = {
  segment: Segment;
};

export default async function SegmentProducts({ segment }: Props) {
  "use cache";

  cacheTag(segment);

  const products = await getProductsBySegment(segment);

  return (
    <SegmentSection
      title={`${segment
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())}`}
      products={products}
    />
  );
}
