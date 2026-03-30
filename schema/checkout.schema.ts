import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^[\+\d\s\-\(\)]+$/, "Enter a valid phone number"),

  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().min(5, "Enter your full street address"),
  address2: z.string().default(""),
  city: z.string().min(1, "City is required"),
  state: z.string().default(""),
  postalCode: z.string().default(""),

  shippingMethod: z.enum(["standard", "express", "free"]).default("standard"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
