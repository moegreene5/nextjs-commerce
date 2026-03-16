import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().superRefine((val, ctx) => {
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
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
