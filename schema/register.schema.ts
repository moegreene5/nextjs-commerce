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
  password: z.string().superRefine((val, ctx) => {
    if (val.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 8 characters",
      });
      return;
    }
    if (!/[A-Z]/.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: "Password must contain at least one uppercase letter",
      });
      return;
    }
    if (!/[a-z]/.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: "Password must contain at least one lowercase letter",
      });
      return;
    }
    if (!/[0-9]/.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: "Password must contain at least one number",
      });
      return;
    }
  }),
  phoneNumber: z.string().regex(/^\+?[0-9]+$/, "Invalid phone number"),
});

export type RegisterData = z.infer<typeof userRegisterSchema>;
