import { DocumentReference, Timestamp } from "firebase-admin/firestore";

export interface ProductDocument {
  slug: string;
  name: string;
  description: string;
  brand: string;
  category: DocumentReference;
  categoryName: string;
  categoryStep: number | null;
  images: { url: string; isPrimary: boolean }[];
  variants: {
    id: string;
    size: string;
    price: number;
    quantityInStore: number;
    sku?: string;
  }[];
  isFeatured: boolean;
  isBestSeller: boolean;
  sale?: {
    type: "percentage" | "fixed";
    value: number;
    startDate: Timestamp;
    endDate: Timestamp;
    label?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Ref {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  step: number | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

export interface ProductImage {
  url: string;
  isPrimary: boolean;
}

export interface Sale {
  type: "percentage" | "fixed";
  value: number;
  startDate: string;
  endDate: string;
  label?: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  price: number;
  salePrice: number | null;
  displayPrice: number;
  isOutOfStock: boolean;
  quantityInStore: number;
  sku?: string;
}

export interface ProductCard {
  id: string;
  slug: string;
  name: string;
  brand: string;
  images: ProductImage[];
  variants: ProductVariant[];
  sale?: Sale;
  isOnSale: boolean;
  isOutOfStock: boolean;
  lowestPrice: number;
  lowestOriginalPrice: number;
  hasMultipleVariants: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  brand: string;
  category: Ref;
  images: ProductImage[];
  variants: ProductVariant[];
  isFeatured: boolean;
  isBestSeller: boolean;
  sale?: Sale;
  isOnSale: boolean;
  isOutOfStock: boolean;
  lowestPrice: number;
  lowestOriginalPrice: number;
  hasMultipleVariants: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductExtrasData {
  categories: Category[];
  brands: Brand[];
}

export interface ProductFilters {
  isFeatured?: boolean;
  isBestSeller?: boolean;
  brand?: string | string[];
  categoryId?: string | string[];
  sortBy?: "createdAt" | "name";
  sortDir?: "asc" | "desc";
  limit?: number;
  startAfterDocId?: string;
}
