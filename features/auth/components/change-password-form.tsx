"use client";

import { useAppForm } from "@/hooks/form";
import { changePasswordSchema } from "@/schema/changePassword.schema";
import { KeyRound, LogOut } from "lucide-react";
import { useEffect } from "react";
import { ChangePassword } from "../auth-actions";

export function ChangePasswordForm() {
  const form = useAppForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onChange: changePasswordSchema,
      onChangeAsyncDebounceMs: 500,
      onSubmitAsync: async ({ value }) => {
        try {
          const res = await ChangePassword(value);

          if (!res || res.success) {
            form.reset();
            return;
          }

          if (res.type === "validation") {
            return {
              form: "Invalid data",
              fields: res.fields,
            };
          }

          return {
            form: res.message,
          };
        } catch {
          return;
        }
      },
    },
    onSubmitInvalid() {
      const invalidInput = document.querySelector(
        '[aria-invalid="true"]',
      ) as HTMLInputElement;
      invalidInput?.focus();
    },
  });

  useEffect(() => {
    form.reset();
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 border border-border p-4">
        <LogOut className="mt-0.5 size-4 shrink-0" />
        <p className="text-sm font-medium leading-relaxed tracking-wider">
          For your security, all active sessions will be signed out after your
          password is changed. You will need to sign in again with your new
          password.
        </p>
      </div>

      <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
        {(error) => {
          const formError = error as { form?: string } | string | undefined;
          const message =
            typeof formError === "object" ? formError?.form : undefined;
          return message ? (
            <p className="text-center text-sm text-red-500" role="alert">
              {message}
            </p>
          ) : null;
        }}
      </form.Subscribe>

      <form.AppField name="currentPassword">
        {(field) => (
          <field.TextField label="Current Password" required type="password" />
        )}
      </form.AppField>

      <form.AppField name="newPassword">
        {(field) => (
          <field.TextField label="New Password" required type="password" />
        )}
      </form.AppField>

      <form.AppField name="confirmPassword">
        {(field) => (
          <field.TextField
            label="Confirm New Password"
            required
            type="password"
          />
        )}
      </form.AppField>

      <form.AppForm>
        <form.SubscribeButton
          className="h-14 w-full rounded-3xl border border-black hover:bg-white hover:text-black transition-colors duration-200 ease-in"
          icon={KeyRound}
          label="Update Password"
        />
      </form.AppForm>
    </form>
  );
}
