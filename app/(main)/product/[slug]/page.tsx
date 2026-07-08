import { Container } from "@/components/ui/container";
import { Product } from "@/features/product/components/product";

import RelatedProducts from "@/features/product/components/related-products";
import { collections, store } from "@/lib/firebase/admin";

export { generateMetadata } from "./metadata";

export async function generateStaticParams() {
  const snapshot = await store.collection(collections.products).select().get();

  return snapshot.docs.map((doc) => ({
    slug: doc.id,
  }));
}

export default async function Page({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;

  return (
    <div>
      <Container className="py-4">
        <Product slug={slug} />
      </Container>
      <RelatedProducts slug={slug} />
    </div>
  );
}
