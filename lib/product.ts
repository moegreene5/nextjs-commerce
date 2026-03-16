import "server-only";

import {
  Product,
  ProductCard,
  ProductDocument,
  ProductVariant,
  Sale,
} from "@/entities/product";
import { optimizeImage } from "@/utils/cloudinary";

export const PRODUCT_CARD_FIELDS = [
  "name",
  "brand",
  "images",
  "variants",
  "sale",
  "slug",
] as const;

function normalizeSale(sale: ProductDocument["sale"]): Sale | undefined {
  if (!sale) return undefined;
  return {
    type: sale.type,
    value: sale.value,
    startDate: sale.startDate.toDate().toISOString(),
    endDate: sale.endDate.toDate().toISOString(),
    label: sale.label,
  };
}

export function computeIsOnSale(sale: ProductDocument["sale"]): boolean {
  if (!sale) return false;
  const now = Date.now();
  return now >= sale.startDate.toMillis() && now <= sale.endDate.toMillis();
}

function normalizeVariants(
  raw: ProductDocument["variants"],
  sale: Sale | undefined,
  isOnSale: boolean,
): ProductVariant[] {
  return (raw ?? []).map((v) => {
    const salePrice =
      isOnSale && sale
        ? sale.type === "percentage"
          ? Math.round(v.price * (1 - sale.value / 100) * 100) / 100
          : Math.max(0, Math.round((v.price - sale.value) * 100) / 100)
        : null;

    return {
      id: v.id,
      size: v.size,
      price: v.price,
      salePrice,
      displayPrice: salePrice ?? v.price,
      quantityInStore: v.quantityInStore,
      isOutOfStock: v.quantityInStore === 0,
      sku: v.sku,
    };
  });
}

function computePricing(variants: ProductVariant[]) {
  const sortedByDisplay = [...variants].sort(
    (a, b) => a.displayPrice - b.displayPrice,
  );
  const sortedByOriginal = [...variants].sort((a, b) => a.price - b.price);
  return {
    lowestPrice: sortedByDisplay[0]?.displayPrice ?? 0,
    lowestOriginalPrice: sortedByOriginal[0]?.price ?? 0,
  };
}

export function normalizeProductCard(
  doc: FirebaseFirestore.QueryDocumentSnapshot,
): ProductCard {
  const data = doc.data() as Pick<
    ProductDocument,
    "name" | "brand" | "images" | "variants" | "sale" | "slug"
  >;

  const isOnSale = computeIsOnSale(data.sale);
  const sale = normalizeSale(data.sale);
  const variants = normalizeVariants(data.variants, sale, isOnSale);
  const { lowestPrice, lowestOriginalPrice } = computePricing(variants);

  return {
    id: doc.id,
    slug: data.slug,
    name: data.name,
    brand: data.brand,
    images: (data.images ?? []).map((img) => ({
      ...img,
      url: optimizeImage(img.url, 550),
    })),
    variants,
    sale,
    isOnSale,
    isOutOfStock: variants.every((v) => v.isOutOfStock),
    lowestPrice,
    lowestOriginalPrice,
    hasMultipleVariants: variants.length > 1,
  };
}

export function normalizeProductDoc(
  doc: FirebaseFirestore.QueryDocumentSnapshot,
): Product {
  const data = doc.data() as ProductDocument;

  const isOnSale = computeIsOnSale(data.sale);
  const sale = normalizeSale(data.sale);
  const variants = normalizeVariants(data.variants, sale, isOnSale);
  const { lowestPrice, lowestOriginalPrice } = computePricing(variants);

  return {
    id: doc.id,
    slug: data.slug ?? doc.id,
    name: data.name,
    description: data.description,
    brand: data.brand,
    category: {
      id: data.category?.id ?? "",
      name: data.categoryName ?? "",
    },
    images: (data.images ?? []).map((img) => ({
      ...img,
      url: optimizeImage(img.url, 900),
    })),
    variants,
    isFeatured: data.isFeatured ?? false,
    isBestSeller: data.isBestSeller ?? false,
    sale,
    isOnSale,
    isOutOfStock: variants.every((v) => v.isOutOfStock),
    lowestPrice,
    lowestOriginalPrice,
    hasMultipleVariants: variants.length > 1,
    createdAt: data.createdAt?.toDate().toISOString() ?? "",
    updatedAt: data.updatedAt?.toDate().toISOString() ?? "",
  };
}
