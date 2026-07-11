import { countryCodes } from "@/lib/countries";
import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1).max(30),
  recipientName: z.string().min(1).max(100),
  phone: z.string().min(7).max(20),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().max(20).optional(),
  country: z.string().refine((c) => countryCodes.has(c), {
    message: "Invalid country code",
  }),
  isDefault: z.boolean().optional().default(false),
});

export type AddAddressInput = z.infer<typeof addressSchema>;

export const updateAddressSchema = addressSchema.partial().extend({
  addressId: z.string().min(1),
});

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
