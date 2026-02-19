import HeroSlider from "@/components/hero-slider";
import SegmentProducts from "@/features/product/components/segment-products";

export default function Home() {
  const images = ["/images/HBBanner3.webp", "/images/HBBanner2.webp"];

  return (
    <main className="pb-4">
      <HeroSlider images={images} />
      <div className="h-1.25 bg-[rgba(255,255,255,0.5)] w-full space-y-6" />
      <div className="space-y-6 mt-4 py-4 px-2.5 sm:px-4 md:px-7">
        <SegmentProducts segment="bestSellers" />
        <SegmentProducts segment="newArrivals" />
        <SegmentProducts segment="comingSoon" />
      </div>
    </main>
  );
}
