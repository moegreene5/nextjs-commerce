import { FieldValue, Timestamp } from "firebase-admin/firestore";

export const MAX_CART_ITEMS = 50;

export type PriceChange =
  | { changed: false }
  | {
      changed: true;
      direction: "up" | "down";
      percentage: number;
      previousPrice: number;
      currentPrice: number;
    };

export type CartItemDocument = {
  productId: string;
  variantId: string;
  size: string;
  priceAtAdded: number;
  quantity: number;
  addedAt: Timestamp;
  updatedAt: Timestamp;
};

export type CartDocumentUpdate = {
  totalQuantity: FieldValue;
  lastActiveAt: Timestamp;
  updatedAt: Timestamp;
  totalItems?: FieldValue;
  cartId?: string;
  createdAt?: Timestamp;
};

export type CartItem = {
  productId: string;
  variantId: string;
  size: string;
  slug: string;
  name: string;
  image: string;
  sku?: string;
  quantity: number;
  priceAtAdded: number;
  currentPrice: number;
  priceChange: PriceChange;
  addedAt: string;
  updatedAt: string;
};

export type Cart = {
  cartId: string;
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  items: CartItem[];
  lastActiveAt: string;
  updatedAt: string;
  createdAt: string;
};

export type GetCartResult =
  | { success: true; cart: Cart }
  | { success: false; error: string };
