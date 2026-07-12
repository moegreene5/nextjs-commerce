"use client";

import { Button } from "@/components/ui/button";
import { Separator as FormDivider } from "@/components/ui/separator";
import { Address } from "@/entities/address";
import {
  addAddress,
  updateAddress,
} from "@/features/addresses/address-actions";
import { useAppForm } from "@/hooks/form";
import {
  AddAddressInput,
  addressSchema,
  emptyAddressValues,
} from "@/schema/address.schema";
import { toast } from "sonner";
import {
  ContactSection,
  DefaultToggleSection,
  LabelSection,
  ShippingAddressSection,
} from "./form-sections";

type AddressFormProps = {
  mode: "add" | "edit";
  initialAddress?: Address;
  onSuccess?: (address: Address) => void;
  onCancel?: () => void;
};

export function AddressForm({
  mode,
  initialAddress,
  onSuccess,
  onCancel,
}: AddressFormProps) {
  const form = useAppForm({
    defaultValues: initialAddress
      ? {
          label: initialAddress.label,
          recipientName: initialAddress.recipientName,
          phone: initialAddress.phone,
          line1: initialAddress.line1,
          line2: initialAddress.line2 ?? "",
          city: initialAddress.city,
          state: initialAddress.state,
          postalCode: initialAddress.postalCode ?? "",
          country: initialAddress.country,
          isDefault: initialAddress.isDefault,
        }
      : (emptyAddressValues as AddAddressInput),
    validators: {
      onChange: addressSchema,
    },
    onSubmit: async ({ value }) => {
      const result =
        mode === "edit" && initialAddress
          ? await updateAddress({ addressId: initialAddress.id, ...value })
          : await addAddress(value);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(mode === "edit" ? "Address updated" : "Address saved");
      onSuccess?.(result.address);
    },
    onSubmitInvalid({ formApi }) {
      // This can be extracted to a function that takes the form ID and `formAPI` as arguments
      const errorMap = formApi.state.errorMap.onChange!;
      const inputs = Array.from(
        // Must match the selector used in your form
        document.querySelectorAll("#address-form input"),
      ) as HTMLInputElement[];

      let firstInput: HTMLInputElement | undefined;
      for (const input of inputs) {
        if (!!errorMap[input.name]) {
          firstInput = input;
          break;
        }
      }
      firstInput?.focus({ preventScroll: false });
    },
  });

  return (
    <form
      id="address-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex h-full flex-col min-h-0"
    >
      <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6 pb-10 min-h-0">
        <LabelSection form={form} />
        <FormDivider />
        <ContactSection form={form} />
        <FormDivider />
        <ShippingAddressSection form={form} />
        <FormDivider />
        <DefaultToggleSection form={form} label="Set as default address" />
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-black px-6 py-4">
        <form.Subscribe selector={(state) => state.isDirty}>
          {(isDirty) => (
            <form.AppForm>
              <form.SubscribeButton
                label={mode === "edit" ? "Save changes" : "Add address"}
                disabled={mode === "edit" && !isDirty}
                className="h-10 rounded-none border border-black bg-black text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:pointer-events-none disabled:opacity-50"
              />
            </form.AppForm>
          )}
        </form.Subscribe>

        {onCancel && (
          <Button
            onClick={onCancel}
            type="button"
            className="h-10 rounded-none border border-black bg-white px-6 text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
