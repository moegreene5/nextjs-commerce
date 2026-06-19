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

interface CartAlertState {
  product: CartAlertProduct | null;
}

let alertTimeoutId: NodeJS.Timeout | null = null;

export const useCartAlertStore = create<CartAlertState>(() => ({
  product: null,
}));

export const show = (product: CartAlertProduct) => {
  if (alertTimeoutId) {
    clearTimeout(alertTimeoutId);
  }

  useCartAlertStore.setState({ product });

  alertTimeoutId = setTimeout(() => {
    useCartAlertStore.setState({ product: null });
    alertTimeoutId = null;
  }, 4000);
};

export const clear = () => {
  if (alertTimeoutId) {
    clearTimeout(alertTimeoutId);
    alertTimeoutId = null;
  }
  useCartAlertStore.setState({ product: null });
};
