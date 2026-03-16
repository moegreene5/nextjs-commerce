import { ExpandableContent } from "@/components/expandable-content";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { cacheTag } from "next/cache";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getProduct } from "../product-queries";
import AddToCartForm from "./add-to-cart-form";
import { ProductImages } from "./product-images";
import { ShareLinks } from "./share-links";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Product({ params }: Props) {
  const { slug } = await params;

  return <CachedProduct slug={slug} />;
}

export async function CachedProduct({ slug }: { slug: string }) {
  "use cache";
  cacheTag(CACHE_TAGS.product(slug));

  const product = await getProduct(slug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const shareUrl = `${siteUrl}/product/${slug}`;

  return (
    <div className="grid md:grid-cols-2 gap-4 lg:gap-12 xl:gap-16">
      <ProductImages images={product.images} />

      <div className="py-2 md:py-8 flex flex-col gap-4">
        <div>
          <h1 className="font-bold text-2xl md:text-3xl">{product.brand}</h1>
          <p className="font-medium text-base md:text-lg text-gray-700 mt-1">
            {product.name}
          </p>
          <span className="inline-block mt-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {product.category.name}
          </span>
        </div>

        <AddToCartForm product={product} />

        <Separator />

        <ExpandableContent lines={3}>
          <div className="text-sm md:text-base text-gray-800 max-w-[65ch] leading-relaxed prose prose-sm prose-neutral">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {product.description}
            </ReactMarkdown>
          </div>
        </ExpandableContent>

        <Separator />

        <ShareLinks
          url={shareUrl}
          title={`${product.brand} - ${product.name}`}
        />
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-4 lg:gap-12 xl:gap-16 animate-pulse mb-12">
      <div className="w-full aspect-square lg:h-svh bg-gray-200 rounded-md" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-3/4 rounded bg-gray-200" />
        <Skeleton className="h-6 w-1/2 rounded bg-gray-200" />
        <Skeleton className="h-5 w-1/4 rounded bg-gray-200 mt-2" />
        <Skeleton className="h-6 w-1/3 rounded bg-gray-200 mt-1" />
        <Skeleton className="h-4 w-full mt-3 rounded bg-gray-200" />
        <Skeleton className="h-10 w-full mt-5 rounded bg-gray-200" />
      </div>
    </div>
  );
}
