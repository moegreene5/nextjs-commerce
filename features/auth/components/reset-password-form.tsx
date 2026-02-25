"use client";

import { useAppForm } from "@/hooks/form";
import { forgotPasswordSchema } from "@/schema/reset.schema";
import { Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { sendResetPasswordEmail } from "../auth-actions";

const FORM_ID = "forgot-password-form";

export function ForgotPasswordFormPage() {
  const [emailSent, setEmailSent] = useState(false);

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: forgotPasswordSchema,
      onChangeAsyncDebounceMs: 500,
      onSubmitAsync: async ({ value }) => {
        try {
          const res = await sendResetPasswordEmail(value);

          if (!res || res.success) {
            form.reset();
            setEmailSent(true);
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
        } catch (error) {
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

  if (emailSent) {
    return (
      <div className="min-w-87.5 flex flex-col items-center text-center gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border border-green-200">
          <MailCheck className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold">Check your inbox</h2>
        <p className="text-sm text-stone-500">
          We sent a password reset link to your email. It may take a few minutes
          to arrive.
        </p>
        <Link
          className="underline underline-offset-6 font-semibold hover:opacity-75 duration-300 ease-in-out mt-2"
          href="/account/login"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-87.5">
      <form
        id={FORM_ID}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-6"
      >
        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => {
            const formError = error as { form?: string } | string | undefined;
            const message =
              typeof formError === "object" ? formError?.form : undefined;

            return message ? (
              <p className="text-sm text-red-500 text-center" role="alert">
                {message}
              </p>
            ) : null;
          }}
        </form.Subscribe>

        <form.AppField name="email">
          {(field) => <field.TextField label="Email" required type="email" />}
        </form.AppField>

        <form.AppForm>
          <form.SubscribeButton
            className="h-14 rounded-3xl w-full hover:bg-white hover:text-black transition-colors duration-200 ease-in border border-black"
            icon={Mail}
            label="Send Reset Link"
          />
        </form.AppForm>
      </form>

      <div className="mt-6 text-center">
        <Link
          className="underline underline-offset-6 font-semibold hover:opacity-75 duration-300 ease-in-out"
          href="/account/login"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
