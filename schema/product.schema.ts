import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export const imageFileSchema = z
  .instanceof(File)
  .refine((f) => f.size > 0, "Image cannot be empty")
  .refine((f) => f.size <= MAX_FILE_SIZE, "Image must be under 5MB")
  .refine(
    (f) => ALLOWED_TYPES.includes(f.type),
    "Only JPG, PNG, WEBP or AVIF allowed",
  );

export const imagesSchema = z
  .array(imageFileSchema)
  .min(1, "At least one image is required")
  .max(6, "Maximum 6 images allowed");

export const variantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
      "Price must be greater than 0",
    ),
  quantityInStore: z
    .string()
    .min(1, "Quantity is required")
    .refine(
      (v) => !isNaN(parseInt(v)) && parseInt(v, 10) >= 0,
      "Quantity cannot be negative",
    ),
  sku: z.string().optional(),
});

const toISO = z
  .string()
  .min(1)
  .transform((val) => new Date(val).toISOString());

const saleSchema = z
  .object({
    type: z.enum(["percentage", "fixed"], {
      error: () => "Sale type must be percentage or fixed",
    }),
    value: z
      .string()
      .min(1, "Sale value is required")
      .refine(
        (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
        "Sale value must be greater than 0",
      ),
    startDate: toISO,
    endDate: toISO,
    label: z.string().optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

const baseProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  brand: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  isFeatured: z.boolean(),
  isBestSeller: z.boolean(),
  primaryIndex: z.number().int().min(0),
  slug: z.string().optional(),
  images: imagesSchema,
  variants: z
    .array(variantSchema)
    .min(1, "At least one variant is required")
    .max(5, "Maximum 5 variants allowed"),
  sale: saleSchema.optional(),
});

export const createProductSchema = baseProductSchema;

export const createProductActionSchema = baseProductSchema
  .omit({ images: true, primaryIndex: true })
  .transform((data) => ({
    ...data,
    variants: data.variants.map((v) => ({
      ...v,
      price: parseFloat(v.price),
      quantityInStore: parseInt(v.quantityInStore, 10),
    })),
    slug: data.slug || undefined,
  }));

export type CreateProductInput = z.input<typeof createProductSchema>;
export type CreateProductOutput = z.output<typeof createProductActionSchema>;
