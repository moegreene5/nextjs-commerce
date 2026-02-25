"use client";

import { useAppForm } from "@/hooks/form";
import { userRegisterSchema } from "@/schema/register.schema";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { registerCustomer } from "../auth-actions";

const FORM_ID = "register-form";

export function RegisterFormPage() {
  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
    },
    validators: {
      onChange: userRegisterSchema,
      onChangeAsyncDebounceMs: 500,
      onSubmitAsync: async ({ value }) => {
        const res = await registerCustomer(value);

        if (!res || res.success) return;

        if (res.type === "validation") {
          return {
            form: "Invalid data",
            fields: res.fields,
          };
        }

        return {
          form: res.message,
        };
      },
    },
    onSubmitInvalid() {
      const invalidInput = document.querySelector(
        '[aria-invalid="true"]',
      ) as HTMLInputElement;

      invalidInput?.focus();
    },
  });

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
        <div className="grid sm:grid-cols-2 gap-4">
          <form.AppField name="firstName">
            {(field) => (
              <field.TextField label="First Name" required type="text" />
            )}
          </form.AppField>

          <form.AppField name="lastName">
            {(field) => (
              <field.TextField label="Last Name" required type="text" />
            )}
          </form.AppField>
        </div>

        <form.AppField name="username">
          {(field) => <field.TextField label="Username" required type="text" />}
        </form.AppField>

        <form.AppField name="email">
          {(field) => <field.TextField label="Email" required type="email" />}
        </form.AppField>

        <form.AppField name="phoneNumber">
          {(field) => (
            <field.TextField label="Phone Number" required type="tel" />
          )}
        </form.AppField>

        <form.AppField name="password">
          {(field) => (
            <field.TextField label="Password" required type="password" />
          )}
        </form.AppField>

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

        <form.AppForm>
          <form.SubscribeButton
            className="h-14 rounded-3xl w-full hover:bg-white hover:text-black transition-colors duration-200 ease-in border border-black"
            icon={UserPlus}
            label="Create Account"
          />
        </form.AppForm>
      </form>

      <div className="mt-6 text-center">
        <Link
          className="underline underline-offset-6 font-semibold hover:opacity-75 duration-300 ease-in-out"
          href="/account/login"
        >
          Already have an account?
        </Link>
      </div>
    </div>
  );
}
