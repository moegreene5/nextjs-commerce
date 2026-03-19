import { Container } from "@/components/ui/container";
import Product, {
  ProductSkeleton,
} from "@/features/product/components/product";
import RelatedProducts, {
  RelatedProductsSkeleton,
} from "@/features/product/components/related-products";
import { collections, store } from "@/lib/firebase/admin";
import { Suspense } from "react";

export { generateMetadata } from "./metadata";

export async function generateStaticParams() {
  const snapshot = await store.collection(collections.products).select().get();

  return snapshot.docs.map((doc) => ({
    slug: doc.id,
  }));
}

export default async function Page({ params }: PageProps<"/product/[slug]">) {
  return (
    <main>
      <Container>
        <div className="min-h-[calc(100svh-66px)] py-4">
          <Suspense fallback={<ProductSkeleton />}>
            <Product params={params} />
          </Suspense>
        </div>
      </Container>
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts params={params} />
      </Suspense>
    </main>
  );
}
