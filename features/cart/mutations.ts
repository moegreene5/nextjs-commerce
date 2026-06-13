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

function rollback(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: readonly string[],
  previousCart?: Cart,
) {
  if (previousCart) queryClient.setQueryData(queryKey, previousCart);
}

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

      queryClient.setQueryData<Cart | null>(queryKey, (old) => {
        const now = new Date();

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

        if (!old) {
          return {
            cartId: "",
            items: [newItem],
            totalItems: 1,
            totalQuantity: vars.quantity,
            subtotal: vars.currentPrice * vars.quantity,
            lastActiveAt: now,
            updatedAt: now,
            createdAt: now,
          };
        }

        const existing = old.items.find((i) => i.variantId === vars.variantId);

        const items = existing
          ? old.items.map((i) =>
              i.variantId === vars.variantId
                ? { ...i, quantity: i.quantity + vars.quantity, updatedAt: now }
                : i,
            )
          : [...old.items, newItem].sort(
              (a, b) => b.addedAt.getTime() - a.addedAt.getTime(),
            );

        return {
          ...old,
          items,
          totalItems: existing ? old.totalItems : old.totalItems + 1,
          totalQuantity: old.totalQuantity + vars.quantity,
          subtotal: old.subtotal + vars.currentPrice * vars.quantity,
          lastActiveAt: now,
          updatedAt: now,
        };
      });

      return { previousCart };
    },
    onSuccess: (result, vars, ctx) => {
      if (!result.success) {
        rollback(queryClient, queryKey, ctx?.previousCart);
        toast.error(result.error);
      }

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
      const now = new Date();

      queryClient.setQueryData<Cart>(queryKey, (old) => {
        if (!old) return old;
        const removed = old.items.find((i) => i.variantId === vars.variantId);
        if (!removed) return old;

        return {
          ...old,
          items: old.items.filter((i) => i.variantId !== vars.variantId),
          totalItems: old.totalItems - 1,
          totalQuantity: old.totalQuantity - removed.quantity,
          subtotal: old.subtotal - removed.currentPrice * removed.quantity,
          lastActiveAt: now,
          updatedAt: now,
        };
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
        const itemRemoved = newQuantity <= 0;

        const items = itemRemoved
          ? old.items.filter((i) => i.variantId !== vars.variantId)
          : old.items.map((i) =>
              i.variantId === vars.variantId
                ? { ...i, quantity: newQuantity, updatedAt: now }
                : i,
            );

        return {
          ...old,
          items,
          totalItems: itemRemoved ? old.totalItems - 1 : old.totalItems,
          totalQuantity: old.totalQuantity + delta,
          subtotal: old.subtotal + delta * target.currentPrice,
          lastActiveAt: now,
          updatedAt: now,
        };
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
