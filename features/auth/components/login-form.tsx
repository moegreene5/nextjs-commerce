"use client";

import { useAppForm } from "@/hooks/form";
import { fugaLoginSchema } from "@/schema/login.schema";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { logIn } from "../auth-actions";
import { useEffect } from "react";

const FORM_ID = "login-form";

export function LoginFormPage() {
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: fugaLoginSchema,
      onChangeAsyncDebounceMs: 500,
      onSubmitAsync: async ({ value }) => {
        try {
          const res = await logIn(value);

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
        } catch (error) {
          return;
        }
      },
    },
    onSubmitInvalid() {
      const InvalidInput = document.querySelector(
        '[aria-invalid="true"]',
      ) as HTMLInputElement;

      InvalidInput?.focus();
    },
  });

  useEffect(() => {
    form.reset();
  }, []);

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

        <form.AppField name="password">
          {(field) => (
            <field.TextField label="Password" required type="password" />
          )}
        </form.AppField>

        <div>
          <Link
            className="underline underline-offset-6 font-semibold hover:opacity-75 duration-300 ease-in-out"
            href="/account/forgot-password"
          >
            Forgot your password?
          </Link>
        </div>

        <form.AppForm>
          <form.SubscribeButton
            className="h-14 rounded-3xl w-full hover:bg-white hover:text-black transition-colors duration-200 ease-in border border-black"
            icon={LogIn}
            label="Sign In"
          />
        </form.AppForm>
      </form>

      <div className="mt-6 text-center">
        <Link
          className="underline underline-offset-6 font-semibold hover:opacity-75 duration-300 ease-in-out"
          href="/account/register"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
