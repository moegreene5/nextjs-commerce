"use client";

import { Address } from "@/entities/address";
import {
  removeAddress,
  setDefaultAddress,
} from "@/features/addresses/address-actions";
import { useTransition } from "react";
import { toast } from "sonner";

export function AddressCard({ address }: { address: Address }) {
  const [isRemoving, startRemoveTransition] = useTransition();
  const [isSettingDefault, startDefaultTransition] = useTransition();

  function handleRemove() {
    startRemoveTransition(async () => {
      const result = await removeAddress(address.id);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleSetDefault() {
    startDefaultTransition(async () => {
      const result = await setDefaultAddress(address.id);
      if (!result.success) toast.error(result.error);
    });
  }

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
            {address.city}, {address.state}
            {address.postalCode ? ` ${address.postalCode}` : ""}
            <br />
            {address.country}
          </address>
        </div>

        <div
          role="group"
          aria-label={`Actions for ${address.label} address`}
          className="flex shrink-0 flex-row flex-wrap gap-2 sm:flex-col"
        >
          <button
            type="button"
            className="border border-black px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Edit
            <span className="sr-only"> {address.label} address</span>
          </button>

          {!address.isDefault && (
            <button
              type="button"
              onClick={handleSetDefault}
              disabled={isSettingDefault || isRemoving}
              className="border border-transparent px-4 py-2 text-sm font-medium text-neutral-600 underline decoration-black decoration-2 underline-offset-4 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:pointer-events-none disabled:opacity-50"
            >
              {isSettingDefault ? "Setting…" : "Set as default"}
              <span className="sr-only"> for {address.label}</span>
            </button>
          )}

          {!address.isDefault && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving || isSettingDefault}
              aria-busy={isRemoving}
              className="border border-transparent px-4 py-2 text-sm font-medium text-neutral-500 underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:text-black hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:pointer-events-none disabled:opacity-50"
            >
              {isRemoving ? "Removing…" : "Remove"}
              <span className="sr-only"> {address.label} address</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
