import Banner from "@/components/banner";
import BestSellers from "@/features/product/components/best-sellers";
import FeaturedProducts from "@/features/product/components/featured-products";

export default function Home() {
  return (
    <main className="pb-4">
      <Banner />
      <div className="h-1.25 bg-[rgba(255,255,255,0.5)] w-full space-y-6" />
      <div className="space-y-16 mt-4 py-8 md:py-12">
        <FeaturedProducts />
        <BestSellers />
      </div>
    </main>
  );
}
