export type PriceChange =
  | { changed: false }
  | {
      changed: true;
      direction: "up" | "down";
      percentage: number;
      previousPrice: number;
      currentPrice: number;
    };

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  priceAtAdded: number;
  currentPrice: number;
  priceChange: PriceChange;
  addedAt: Date;
  updatedAt: Date;
};

export type Cart = {
  cartId: string;
  isGuest: boolean;
  totalItems: number;
  subtotal: number;
  items: CartItem[];
  lastActiveAt: Date;
  updatedAt: Date;
  createdAt: Date;
};
