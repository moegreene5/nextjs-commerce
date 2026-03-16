import { z } from "zod";

export const userRegisterSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  username: z.string().superRefine((val, ctx) => {
    if (val.length < 3) {
      ctx.addIssue({
        code: "custom",
        message: "Username must be at least 3 characters",
      });
    }
    if (val.length > 30) {
      ctx.addIssue({
        code: "custom",
        message: "Username must be at most 30 characters",
      });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: "Username can only contain letters, numbers, and underscores",
      });
    }
  }),
  email: z.string().email("Invalid email address"),
  password: z.string().superRefine((val, ctx) => {
    if (val.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 8 characters",
      });
    }
    if (!/[A-Z]/.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: "Password must contain at least one uppercase letter",
      });
    }
    if (!/[a-z]/.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: "Password must contain at least one lowercase letter",
      });
    }
    if (!/[0-9]/.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: "Password must contain at least one number",
      });
    }
  }),
  phoneNumber: z.string().superRefine((val, ctx) => {
    if (!/^\+?[0-9]+$/.test(val)) {
      ctx.addIssue({ code: "custom", message: "Invalid phone number" });
    }
    if (val.replace(/^\+/, "").length < 7) {
      ctx.addIssue({ code: "custom", message: "Phone number is too short" });
    }
    if (val.replace(/^\+/, "").length > 15) {
      ctx.addIssue({ code: "custom", message: "Phone number is too long" });
    }
  }),
});

export type RegisterData = z.infer<typeof userRegisterSchema>;

export const userProfileSchema = userRegisterSchema.omit({ email: true });
export type ProfileData = z.infer<typeof userProfileSchema>;
