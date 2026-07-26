"use client";

import { Address } from "@/entities/address";
import { useState } from "react";
import { CheckoutForm } from "./checkout-form";

export function CheckoutFlow({
  savedAddresses,
  isLoggedIn,
  userEmail,
}: {
  savedAddresses: Address[];
  isLoggedIn: boolean;
  userEmail?: string;
}) {
  const [payment, setPayment] = useState<{
    clientSecret: string;
    orderId: string;
  } | null>(null);

  if (payment) {
    return (
      <div className="text-sm text-neutral-500">
        Payment step for order {payment.orderId} — clientSecret ready.
      </div>
    );
  }

  return (
    <CheckoutForm
      savedAddresses={savedAddresses}
      isLoggedIn={isLoggedIn}
      userEmail={userEmail}
      onOrderCreated={(clientSecret, orderId) =>
        setPayment({ clientSecret, orderId })
      }
    />
  );
}
