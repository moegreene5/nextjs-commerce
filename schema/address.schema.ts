import { countryCodes } from "@/lib/countries";
import { z } from "zod";

export const addressSchema = z.object({
  label: z
    .string()
    .min(1, "Give this address a name, like Home or Work")
    .max(30, "Keep the address name under 30 characters"),

  recipientName: z
    .string()
    .min(1, "Enter the recipient's full name")
    .max(100, "That name looks too long — check for a typo"),

  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .max(20, "That phone number looks too long — check for a typo"),

  line1: z
    .string()
    .min(1, "Enter a street address")
    .max(200, "That address looks too long — check for a typo"),

  line2: z
    .string()
    .max(200, "That looks too long — check for a typo")
    .optional(),

  city: z
    .string()
    .min(1, "Enter a city")
    .max(100, "That city name looks too long — check for a typo"),

  state: z
    .string()
    .min(1, "Enter a state or province")
    .max(100, "That looks too long — check for a typo"),

  postalCode: z
    .string()
    .max(20, "That postal code looks too long — check for a typo")
    .optional(),

  country: z.string().refine((c) => countryCodes.has(c), {
    message: "Select a country from the list",
  }),

  isDefault: z.boolean(),
});

export type AddAddressInput = z.infer<typeof addressSchema>;

export const updateAddressSchema = addressSchema.partial().extend({
  addressId: z.string().min(1, "Missing address reference"),
});

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export const emptyAddressValues: AddAddressInput = {
  label: "",
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};
