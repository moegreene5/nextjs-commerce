import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
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
});

export type LoginFormData = z.infer<typeof loginSchema>;
