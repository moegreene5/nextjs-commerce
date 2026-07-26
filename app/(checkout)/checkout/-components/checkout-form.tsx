"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Address } from "@/entities/address";
import {
  ContactSection,
  ShippingAddressSection,
} from "@/features/addresses/components/form-sections";
import { useAppForm } from "@/hooks/form";
import { checkoutShippingAddressSchema } from "@/schema/checkout.schema";
import { useState } from "react";

type CheckoutFormProps = {
  savedAddresses: Address[];
  isLoggedIn: boolean;
  userEmail?: string;
  onOrderCreated: (clientSecret: string, orderId: string) => void;
};

export function CheckoutForm({
  savedAddresses,
  isLoggedIn,
  userEmail,
  onOrderCreated,
}: CheckoutFormProps) {
  const defaultAddress =
    savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultAddress?.id ?? null,
  );
  const [usingNewAddress, setUsingNewAddress] = useState(
    savedAddresses.length === 0,
  );
  const [email, setEmail] = useState(userEmail ?? "");
  const [saveAddress, setSaveAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useAppForm({
    defaultValues: {
      recipientName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    validators: {
      onChange: checkoutShippingAddressSchema,
    },
    onSubmit: async ({ value }) => {
      await submitOrder(value);
    },
  });

  async function submitOrder(shippingAddress: typeof form.state.values) {}

  function handleUseSelected() {
    const selected = savedAddresses.find((a) => a.id === selectedId);
    if (!selected) return;
    submitOrder({
      recipientName: selected.recipientName,
      phone: selected.phone,
      line1: selected.line1,
      line2: selected.line2 ?? "",
      city: selected.city,
      state: selected.state,
      postalCode: selected.postalCode ?? "",
      country: selected.country,
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <label className="text-sm font-medium text-black">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 h-10 rounded-none"
        />
      </div>

      {!usingNewAddress && savedAddresses.length > 0 ? (
        <div className="space-y-4">
          <p className="font-geologica capitalize font-medium text-neutral-500">
            Delivery address
          </p>

          <div className="space-y-3">
            {savedAddresses.map((addr) => (
              <label
                key={addr.id}
                className="flex cursor-pointer items-start gap-3 border border-black p-4"
              >
                <input
                  type="radio"
                  name="shippingAddress"
                  checked={selectedId === addr.id}
                  onChange={() => setSelectedId(addr.id)}
                  className="mt-1 accent-black"
                />
                <div className="text-sm">
                  <p className="font-medium text-black">{addr.label}</p>
                  <p className="text-neutral-600">
                    {addr.recipientName} · {addr.phone}
                  </p>
                  <p className="text-neutral-600">
                    {addr.line1}, {addr.city}, {addr.state}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <Button
            type="button"
            variant={"ghost"}
            onClick={() => setUsingNewAddress(true)}
            className="text-sm underline"
          >
            + Use a different address
          </Button>

          <button
            type="button"
            onClick={handleUseSelected}
            disabled={!selectedId || isSubmitting}
            className="h-11 w-full rounded-none border border-black bg-black text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? "Placing order…" : "Continue to payment"}
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-8"
        >
          <ContactSection form={form} />
          <ShippingAddressSection form={form} />

          {isLoggedIn && (
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4 accent-black"
              />
              <span className="text-sm font-medium text-black">
                Save this address to my account
              </span>
            </label>
          )}

          {savedAddresses.length > 0 && (
            <button
              type="button"
              onClick={() => setUsingNewAddress(false)}
              className="text-sm underline"
            >
              ← Use a saved address
            </button>
          )}

          <form.AppForm>
            <form.SubscribeButton
              label={isSubmitting ? "Placing order…" : "Continue to payment"}
              disabled={isSubmitting}
              className="h-11 w-full rounded-none border border-black bg-black text-sm font-medium uppercase text-white transition-colors hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-50"
            />
          </form.AppForm>
        </form>
      )}
    </div>
  );
}
