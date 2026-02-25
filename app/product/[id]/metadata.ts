import { getProduct } from "@/features/product/product-queries";
import { makeKeywords } from "@/utils/make-keywords";
import { Metadata } from "next";
import { cacheTag } from "next/cache";

export async function generateMetadata({
  params,
}: PageProps<"/product/[id]">): Promise<Metadata> {
  "use cache";

  const id = (await params).id;

  cacheTag(id);

  const product = await getProduct(id);

  if (!product) return {};

  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/product/${id}`;
  const keywords = makeKeywords(product.name);

  return {
    title: product.name,
    description: product.description,
    keywords,
    openGraph: {
      title: product.name,
      description: product.description,
      url: productUrl,
      type: "website",
      locale: "en_NG",
      siteName: "Next 16 Products App Commerce",
      images: [
        {
          url: product.image[0],
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.image[0],
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  };
}
