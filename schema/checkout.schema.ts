import { z } from "zod";
import { countryCodes } from "@/lib/countries";

export const checkoutShippingAddressSchema = z.object({
  recipientName: z.string().min(1, "Enter the recipient's full name"),
  phone: z.string().min(7, "Enter a valid phone number"),
  line1: z.string().min(1, "Enter a street address"),
  line2: z.string().max(200, "That looks too long — check for a typo"),
  city: z.string().min(1, "Enter a city"),
  state: z.string().min(1, "Enter a state or province"),
  postalCode: z.string(),
  country: z.string().refine((c) => countryCodes.has(c), {
    message: "Select a country from the list",
  }),
});

export const createOrderSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  shippingAddress: checkoutShippingAddressSchema,
  saveAddress: z.boolean().default(false),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
