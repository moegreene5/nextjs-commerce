import { getProduct } from "@/features/product/product-queries";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: PageProps<"/product/[id]">): Promise<Metadata> {
  "use cache";

  const id = (await params).id;
  const product = await getProduct(id);

  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
  };
}
