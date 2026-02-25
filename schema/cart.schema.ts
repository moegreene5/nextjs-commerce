import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  price: z.number().positive("Price must be a positive number"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Minimum quantity is 1")
    .max(100, "Maximum quantity is 100")
    .optional()
    .default(1),
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
  productId: z.string().min(1, "Product ID is required"),
});

export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
