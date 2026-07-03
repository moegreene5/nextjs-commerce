"use client";

import type { Cart } from "@/entities/cart";
import { createEmptyCart, recalcTotals } from "@/lib/cart";
import type {
  AddToCartInput,
  IncreaseOrDecreaseInput,
  RemoveFromCartInput,
} from "@/schema/cart.schema";
import { show } from "@/store/add-product-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addToCart,
  incrementOrDecreaseQuantity,
  removeItemFromCart,
} from "./cart-actions";
import { cartQueryOptions } from "./queries";

type AddToCartVariables = AddToCartInput & {
  slug: string;
  name: string;
  image: string;
  size: string;
  currentPrice: number;
  originalPrice: number | null;
  isOnSale: boolean;
};

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { queryKey } = cartQueryOptions();

  return useMutation({
    mutationFn: (vars: AddToCartVariables) =>
      addToCart({
        productId: vars.productId,
        variantId: vars.variantId,
        quantity: vars.quantity,
      }),

    onSuccess: (result, vars) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      queryClient.setQueryData<Cart>(queryKey, (old) => {
        const base = old ?? createEmptyCart(result.cartId);
        const exists = base.items.some(
          (i) => i.variantId === result.item.variantId,
        );

        const items = exists
          ? [
              result.item,
              ...base.items.filter(
                (i) => i.variantId !== result.item.variantId,
              ),
            ]
          : [result.item, ...base.items];

        return {
          ...base,
          cartId: result.cartId,
          items,
          ...recalcTotals(items),
        };
      });

      show({
        id: vars.productId,
        name: vars.name,
        image: vars.image,
        slug: vars.slug,
        variantSize: vars.size,
        displayPrice: vars.currentPrice,
        originalPrice: vars.originalPrice,
        isOnSale: vars.isOnSale,
      });
    },

    onError: () => {
      toast.error("Failed to add item to cart");
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const { queryKey } = cartQueryOptions();

  return useMutation({
    mutationFn: (vars: RemoveFromCartInput) => removeItemFromCart(vars),

    onSuccess: (result, vars) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      queryClient.setQueryData<Cart>(queryKey, (old) => {
        if (!old) return old;
        const items = old.items.filter((i) => i.variantId !== vars.variantId);
        return {
          ...old,
          items,
          ...recalcTotals(items),
          updatedAt: new Date().toISOString(),
        };
      });
    },

    onError: () => {
      toast.error("Failed to remove item");
    },
  });
}

export function useUpdateQuantity() {
  const queryClient = useQueryClient();
  const { queryKey } = cartQueryOptions();

  return useMutation({
    mutationFn: (vars: IncreaseOrDecreaseInput) =>
      incrementOrDecreaseQuantity(vars),

    onSuccess: (result, vars) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const delta = vars.type === "increase" ? 1 : -1;
      const nowString = new Date().toISOString();

      queryClient.setQueryData<Cart>(queryKey, (old) => {
        if (!old) return old;
        const target = old.items.find((i) => i.variantId === vars.variantId);
        if (!target) return old;

        const newQuantity = target.quantity + delta;
        const items =
          newQuantity <= 0
            ? old.items.filter((i) => i.variantId !== vars.variantId)
            : old.items.map((i) =>
                i.variantId === vars.variantId
                  ? { ...i, quantity: newQuantity, updatedAt: nowString }
                  : i,
              );

        return {
          ...old,
          items,
          ...recalcTotals(items),
          updatedAt: nowString,
        };
      });
    },

    onError: () => {
      toast.error("Failed to update quantity");
    },
  });
}
