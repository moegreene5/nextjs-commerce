import { z } from "zod";

export const userRegisterSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phoneNumber: z
    .string()
    .min(7, "Phone number too short")
    .max(20)
    .regex(/^\+?[0-9]+$/, "Invalid phone number"),
  businessName: z
    .string()
    .min(1, "Business name is required")
    .max(100)
    .optional(),
  businessAddress: z
    .string()
    .min(5, "Business address too short")
    .max(255)
    .optional(),
  instagramName: z
    .string()
    .min(1)
    .max(30)
    .regex(/^[a-zA-Z0-9._]+$/, "Invalid Instagram username")
    .optional(),
});

export type RegisterData = z.infer<typeof userRegisterSchema>;
