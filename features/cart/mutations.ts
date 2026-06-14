"use client";
import type { Cart, CartItem } from "@/entities/cart";
import type {
  AddToCartInput,
  IncreaseOrDecreaseInput,
  RemoveFromCartInput,
} from "@/schema/cart.schema";
import { useCartAlertStore } from "@/store/add-product-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addToCart,
  incrementOrDecreaseQuantity,
  removeItemFromCart,
} from "./cart-actions";
import { cartQueryOptions } from "./queries";
import { createEmptyCart, recalcTotals } from "@/lib/cart";

type AddToCartVariables = AddToCartInput & {
  slug: string;
  name: string;
  image: string;
  size: string;
  currentPrice: number;
  originalPrice: number | null;
  isOnSale: boolean;
};

function rollback(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: readonly string[],
  previousCart?: Cart,
) {
  if (previousCart) queryClient.setQueryData(queryKey, previousCart);
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { queryKey } = cartQueryOptions();
  const show = useCartAlertStore((s) => s.show);

  return useMutation({
    mutationFn: (vars: AddToCartVariables) =>
      addToCart({
        productId: vars.productId,
        variantId: vars.variantId,
        quantity: vars.quantity,
      }),

    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<Cart>(queryKey);
      const base = previousCart ?? createEmptyCart("");
      const now = new Date();

      const existing = base.items.find((i) => i.variantId === vars.variantId);

      const newItem: CartItem = {
        productId: vars.productId,
        variantId: vars.variantId,
        size: vars.size,
        slug: vars.slug,
        name: vars.name,
        image: vars.image,
        quantity: vars.quantity,
        priceAtAdded: vars.currentPrice,
        currentPrice: vars.currentPrice,
        priceChange: { changed: false },
        addedAt: now,
        updatedAt: now,
      };

      const items = existing
        ? base.items.map((i) =>
            i.variantId === vars.variantId
              ? { ...i, quantity: i.quantity + vars.quantity, updatedAt: now }
              : i,
          )
        : [newItem, ...base.items];

      queryClient.setQueryData<Cart>(queryKey, {
        ...base,
        items,
        ...recalcTotals(items),
        lastActiveAt: now,
        updatedAt: now,
      });

      return { previousCart };
    },

    onSuccess: (result, vars, ctx) => {
      if (!result.success) {
        rollback(queryClient, queryKey, ctx?.previousCart);
        toast.error(result.error);
        return;
      }

      queryClient.setQueryData<Cart>(queryKey, (old) => {
        const base = old ?? createEmptyCart(result.cartId);
        const items = base.items.map((i) =>
          i.variantId === result.item.variantId ? result.item : i,
        );
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

    onError: (_err, _vars, ctx) => {
      rollback(queryClient, queryKey, ctx?.previousCart);
      toast.error("Failed to add item to cart");
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const { queryKey } = cartQueryOptions();

  return useMutation({
    mutationFn: (vars: RemoveFromCartInput) => removeItemFromCart(vars),

    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<Cart>(queryKey);

      queryClient.setQueryData<Cart>(queryKey, (old) => {
        if (!old) return old;
        const items = old.items.filter((i) => i.variantId !== vars.variantId);
        return { ...old, items, ...recalcTotals(items), updatedAt: new Date() };
      });

      return { previousCart };
    },

    onSuccess: (result, _vars, ctx) => {
      if (!result.success) {
        rollback(queryClient, queryKey, ctx?.previousCart);
        toast.error(result.error);
      }
    },

    onError: (_err, _vars, ctx) => {
      rollback(queryClient, queryKey, ctx?.previousCart);
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

    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<Cart>(queryKey);
      const delta = vars.type === "increase" ? 1 : -1;
      const now = new Date();

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
                  ? { ...i, quantity: newQuantity, updatedAt: now }
                  : i,
              );

        return { ...old, items, ...recalcTotals(items), updatedAt: now };
      });

      return { previousCart };
    },

    onSuccess: (result, _vars, ctx) => {
      if (!result.success) {
        rollback(queryClient, queryKey, ctx?.previousCart);
        toast.error(result.error);
      }
    },

    onError: (_err, _vars, ctx) => {
      rollback(queryClient, queryKey, ctx?.previousCart);
      toast.error("Failed to update quantity");
    },
  });
}
