import { Container } from "@/components/ui/container";
import Product, {
  ProductSkeleton,
} from "@/features/product/components/product";
import RelatedProducts, {
  RelatedProductsSkeleton,
} from "@/features/product/components/related-products";
import { Suspense } from "react";

export { generateMetadata } from "./metadata";

export default function Page({ params }: PageProps<"/product/[id]">) {
  return (
    <main>
      <Container>
        <div className="min-h-[calc(100svh-80px)] py-4">
          <Suspense fallback={<ProductSkeleton />}>
            <Product params={params} />
          </Suspense>
        </div>
      </Container>

      <div className="my-8 md:my-16 mb-16">
        <div className="px-page">
          <h4 className="text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
            You might also like
          </h4>
        </div>

        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProducts params={params} />
        </Suspense>
      </div>
    </main>
  );
}
