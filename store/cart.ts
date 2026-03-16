import { create } from "zustand";
import { GetCartResult } from "@/features/cart/cart-queries";

type CartStore = {
  cart: GetCartResult | null;
  isLoading: boolean;
  setCart: (cart: GetCartResult) => void;
};

export const useCartStore = create<CartStore>((set) => ({
  cart: null,
  isLoading: true,
  setCart: (cart) => set({ cart, isLoading: false }),
}));
