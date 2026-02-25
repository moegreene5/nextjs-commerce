import SegmentProducts from "@/features/product/components/segment-products";
import Banner from "@/components/banner";

export default function Home() {
  return (
    <main className="pb-4">
      <Banner />
      <div className="h-1.25 bg-[rgba(255,255,255,0.5)] w-full space-y-6" />
      <div className="space-y-16 mt-4 py-8 md:py-12">
        <SegmentProducts segment="bestSellers" />
        <SegmentProducts segment="newArrivals" />
        <SegmentProducts segment="comingSoon" />
      </div>
    </main>
  );
}
