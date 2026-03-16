"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Profile } from "@/entities/user";
import { useAppForm } from "@/hooks/form";
import { userProfileSchema } from "@/schema/register.schema";
import { SetStateAction } from "react";
import { toast } from "sonner";
import { updateUserProfile } from "../user-action";
import { Views } from "./user-account-information";

const FORM_ID = "edit-user-profile-form";

type UserProfileProps = {
  profile: Profile | null;
  setView: React.Dispatch<SetStateAction<Views>>;
};

export function EditUserProfile({ profile, setView }: UserProfileProps) {
  const form = useAppForm({
    defaultValues: {
      firstName: profile?.name.firstName || "",
      lastName: profile?.name.lastName || "",
      username: profile?.userName || "",
      phoneNumber: profile?.phoneNumber || "",
      password: "",
    },
    validators: {
      onChange: userProfileSchema,
      onChangeAsyncDebounceMs: 500,
      onSubmitAsync: async ({ value }) => {
        const result = await updateUserProfile(value);

        if (!result || result.success) {
          toast.success("Profile successfully updated");
          setView("view");
          return;
        }

        if (result.type === "validation") {
          return {
            form: "Invalid data",
            fields: result.fields,
          };
        }

        return {
          form: result.message,
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
        <div className="grid md:grid-cols-2 gap-4">
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

          <form.AppField name="username">
            {(field) => (
              <field.TextField label="Username" required type="text" />
            )}
          </form.AppField>

          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={profile?.email || ""}
              disabled
              className="h-10"
            />
          </div>

          <form.AppField name="phoneNumber">
            {(field) => (
              <field.TextField label="Phone Number" required type="tel" />
            )}
          </form.AppField>

          <p className="col-span-full text-sm text-muted-foreground">
            In order to save your changes please confirm your password
          </p>

          <form.AppField name="password">
            {(field) => (
              <field.TextField
                label="Confirm Password"
                required
                type="password"
              />
            )}
          </form.AppField>

          <div className="col-span-full flex justify-center">
            <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
              {(error) => {
                const formError = error as
                  | { form?: string }
                  | string
                  | undefined;
                const message =
                  typeof formError === "object" ? formError?.form : undefined;

                return message ? (
                  <p className="text-sm text-red-500 text-center" role="alert">
                    {message}
                  </p>
                ) : null;
              }}
            </form.Subscribe>
          </div>

          <div className="col-span-full flex gap-2.5 md:gap-4">
            <Button
              type="button"
              className="bg-gray-200 text-black hover:bg-[#897f7b]"
              onClick={() => setView("view")}
            >
              Cancel
            </Button>
            <form.AppForm>
              <form.Subscribe selector={(state) => state.isDirty}>
                {(isDirty) => (
                  <form.SubscribeButton
                    label="Save details"
                    disabled={!isDirty}
                  />
                )}
              </form.Subscribe>
            </form.AppForm>
          </div>
        </div>
      </form>
    </div>
  );
}
