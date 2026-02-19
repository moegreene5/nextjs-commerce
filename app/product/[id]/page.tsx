import { Container } from "@/components/ui/container";
import Product from "@/features/product/components/product";
import RelatedProducts, {
  RelatedProductsSkeleton,
} from "@/features/product/components/related-products";
import { Suspense, ViewTransition } from "react";

export { generateMetadata } from "./metadata";

export default function Page({ params }: PageProps<"/product/[id]">) {
  return (
    <Suspense fallback={<p>Loading product...</p>}>
      <ProductPage params={params} />
    </Suspense>
  );
}

async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Container className="py-8 pb-12 lg:pb-20 min-h-svh">
      <ViewTransition exit="duration-100" name={`product-${id}`}>
        <Product productId={id} />
      </ViewTransition>

      <div>
        <h4 className="text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
          You might also like
        </h4>
      </div>

      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts productId={id} />
      </Suspense>
    </Container>
  );
}
