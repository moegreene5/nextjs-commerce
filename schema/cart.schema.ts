import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Minimum quantity is 1")
    .max(100, "Maximum quantity is 100"),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const removeFromCartSchema = z.object({
  variantId: z.string().min(1),
});
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;

export const increaseOrDecreaseQuantitySchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  type: z.enum(["increase", "decrease"]),
});

export type IncreaseOrDecreaseInput = z.infer<
  typeof increaseOrDecreaseQuantitySchema
>;
