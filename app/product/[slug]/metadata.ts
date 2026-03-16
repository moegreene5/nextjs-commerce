import { getProduct } from "@/features/product/product-queries";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { makeKeywords } from "@/utils/make-keywords";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return getCachedMetadata(slug);
}

async function getCachedMetadata(slug: string): Promise<Metadata> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.product(slug));

  const product = await getProduct(slug);

  if (!product) return {};

  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/product/${slug}`;
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
      images: product.images.map((current) => ({
        url: current.url,
        width: 1200,
        height: 630,
        alt: product.name,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.images.map((current) => ({
        url: current.url,
        width: 1200,
        height: 630,
        alt: product.name,
      })),
    },
  };
}
