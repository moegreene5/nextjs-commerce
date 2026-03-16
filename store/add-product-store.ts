import { create } from "zustand";

interface CartAlertProduct {
  id: string;
  name: string;
  image: string;
  slug: string;
  variantSize: string;
  displayPrice: number;
  originalPrice: number | null;
  isOnSale: boolean;
}

interface CartAlertStore {
  product: CartAlertProduct | null;
  show: (product: CartAlertProduct) => void;
  clear: () => void;
}

export const useCartAlertStore = create<CartAlertStore>((set) => ({
  product: null,
  show: (product) => {
    set({ product });
    setTimeout(() => set({ product: null }), 4000);
  },
  clear: () => set({ product: null }),
}));
