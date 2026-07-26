"use client";

import { Button } from "@/components/ui/button";
import { Address } from "@/entities/address";
import {
  removeAddress,
  setDefaultAddress,
} from "@/features/addresses/address-actions";
import { openModal } from "@/store/modal";
import { useState, useTransition } from "react";
import { toast } from "sonner";

function DotsPending({ label }: { label: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className="flex h-9 items-center gap-1 px-4"
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]"
      />
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]"
      />
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400"
      />
    </span>
  );
}

export function AddressCard({ address }: { address: Address }) {
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<
    "remove" | "default" | null
  >(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  function handleRemove() {
    if (!confirmingRemove) {
      setConfirmingRemove(true);
      return;
    }
    setPendingAction("remove");
    startTransition(async () => {
      const result = await removeAddress(address.id);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(`${address.label} address removed`);
      }
      setPendingAction(null);
      setConfirmingRemove(false);
    });
  }

  function handleSetDefault() {
    setPendingAction("default");
    startTransition(async () => {
      const result = await setDefaultAddress(address.id);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(`${address.label} set as default address`);
      }
      setPendingAction(null);
    });
  }

  const cityLine =
    [address.city, address.state].filter(Boolean).join(", ") +
    (address.postalCode ? ` ${address.postalCode}` : "");

  return (
    <article
      aria-labelledby={`address-label-${address.id}`}
      className="relative border border-black bg-white"
    >
      {address.isDefault && (
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-10 w-10 overflow-hidden"
        >
          <div className="absolute -right-5.5 top-2.25 w-20 rotate-45 bg-black py-0.5 text-center text-[8px] font-semibold uppercase tracking-wider text-white">
            Default
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3
            id={`address-label-${address.id}`}
            className="mt-1 text-lg font-semibold text-black"
          >
            {address.label}
            {address.isDefault && (
              <span className="sr-only"> (default address)</span>
            )}
          </h3>
          <p className="mt-3 text-sm font-medium text-black">
            {address.recipientName}
            <span aria-hidden="true" className="mx-2 text-neutral-400">
              /
            </span>
            <span className="sr-only">Phone: </span>
            <span className="text-neutral-500">{address.phone}</span>
          </p>

          <address className="mt-2 text-sm not-italic leading-relaxed text-neutral-600">
            {address.line1}
            {address.line2 && (
              <>
                <br />
                {address.line2}
              </>
            )}
            <br />
            {cityLine}
            <br />
            {address.country}
          </address>
        </div>

        <div
          role="group"
          aria-label="Address actions"
          className="flex shrink-0 flex-row flex-wrap gap-2 sm:flex-col sm:items-end"
        >
          <Button
            onClick={() => openModal("address", address)}
            disabled={isPending}
            className="sm:w-full"
          >
            Edit
            <span className="sr-only"> {address.label} address</span>
          </Button>

          {!address.isDefault &&
            (pendingAction === "default" ? (
              <DotsPending label="Setting as default" />
            ) : (
              <button
                type="button"
                onClick={handleSetDefault}
                disabled={isPending}
                className="border border-transparent px-4 py-2 text-sm font-medium text-neutral-500 underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:text-black hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:pointer-events-none disabled:opacity-50"
              >
                Set as default
                <span className="sr-only"> for {address.label}</span>
              </button>
            ))}

          {!address.isDefault &&
            (pendingAction === "remove" ? (
              <DotsPending label="Removing address" />
            ) : confirmingRemove ? (
              <div className="flex flex-row gap-2 sm:flex-col">
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isPending}
                  className="border border-transparent px-4 py-2 text-sm font-medium text-red-600 underline decoration-red-600 decoration-2 underline-offset-4 transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:pointer-events-none disabled:opacity-50"
                >
                  Confirm remove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingRemove(false)}
                  disabled={isPending}
                  className="border border-transparent px-4 py-2 text-sm font-medium text-neutral-500 underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:text-black hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:pointer-events-none disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isPending}
                className="border border-transparent px-4 py-2 text-sm font-medium text-neutral-500 underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:text-black hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:pointer-events-none disabled:opacity-50"
              >
                Remove
                <span className="sr-only"> {address.label} address</span>
              </button>
            ))}
        </div>
      </div>
    </article>
  );
}
