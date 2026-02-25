import { ExpandableContent } from "@/components/expandable-content";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus } from "lucide-react";
import { cacheTag } from "next/cache";
import { getProduct } from "../product-queries";
import { ProductImages } from "./product-images";
import { ShareLinks } from "./share-links";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Product({ params }: Props) {
  const productId = (await params).id;

  return <CachedProduct productId={productId} />;
}

async function CachedProduct({ productId }: { productId: string }) {
  "use cache";

  cacheTag(`product-${productId}`);

  const product = await getProduct(productId);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const shareUrl = `${siteUrl}/product/${productId}`;

  return (
    <div className="grid md:grid-cols-2 gap-4 lg:gap-12 xl:gap-16">
      <ProductImages images={[...product.image, ...product.image]} />

      <div className="py-8 flex flex-col gap-4">
        <div>
          <h1 className="font-bold text-2xl md:text-3xl">{product.brand}</h1>
          <p className="font-medium text-base md:text-lg text-gray-700 mt-1">
            {product.name}
          </p>
        </div>

        <div>
          <span className="inline-block px-3 py-1 bg-black text-white rounded-md text-sm font-medium">
            {product.size}
          </span>
        </div>

        <div className="mt-2">
          <span className="text-xl font-semibold text-gray-900 font-geologica">
            ${product.price}
          </span>
        </div>

        <div className="my-4 flex flex-wrap gap-4">
          <div className="flex items-center rounded-[49px] gap-4 border border-black min-h-14 md:min-h-16">
            <Button className="w-11" variant={"ghost"}>
              <Minus />
            </Button>

            <Button className="w-11" variant={"ghost"}>
              <Plus />
            </Button>
          </div>

          <Button className="flex-1 rounded-[49px] min-h-14 md:min-h-16 px-5 h-auto uppercase tracking-widest hover:bg-white border border-primary hover:text-black">
            Add To Cart
          </Button>
        </div>

        <Separator />

        <ExpandableContent>
          <p className="text-sm md:text-base text-gray-800 max-w-[65ch] leading-relaxed">
            {product.description}
          </p>
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
