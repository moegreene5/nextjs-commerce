"use server";

import type { Address, OrderDocument, OrderLineItem } from "@/entities/order";
import { getCurrentUser } from "@/features/user/user-queries";
import { AppError } from "@/lib/errors";
import { collections, store } from "@/lib/firebase/admin";
import { stripe } from "@/lib/stripe/server";
import type { checkoutShippingAddressSchema } from "@/schema/checkout.schema";
import { Timestamp } from "firebase-admin/firestore";
import type { z } from "zod";
import { addAddress } from "../addresses/address-actions";
import { getCart } from "../cart/cart-queries";

type ShippingAddress = z.infer<typeof checkoutShippingAddressSchema>;

function generateOrderNumber(): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
}

function calculateShipping(subtotal: number): { label: string; cost: number } {
  const FREE_SHIPPING_THRESHOLD = 100;
  const FLAT_RATE = 10;

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return { label: "Standard (Free)", cost: 0 };
  }
  return { label: "Standard", cost: FLAT_RATE };
}

function calculateTax(_input: {
  subtotal: number;
  shippingCost: number;
  shippingAddress: ShippingAddress;
}): number {
  return 0;
}

export async function createOrderAndPaymentIntent(
  shippingAddress: ShippingAddress,
  opts: {
    email: string;
    saveAddress: boolean;
    billingAddress?: Address;
  },
) {
  const session = await getCurrentUser();

  const cartData = await getCart();
  if (!cartData.success) throw new Error("Error getting cart.");
  const { cart } = cartData;

  if (!cart.items.length) throw new AppError("Cart is empty.", "EMPTY_CART");

  const items: OrderLineItem[] = cart.items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    name: item.name,
    slug: item.slug,
    image: item.image,
    size: item.size,
    sku: item.sku,
    unitPrice: item.currentPrice,
    quantity: item.quantity,
    lineTotal: item.currentPrice * item.quantity,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const discountAmount = 0;
  const { label: shippingLabel, cost: shippingCost } =
    calculateShipping(subtotal);
  const tax = calculateTax({ subtotal, shippingCost, shippingAddress });
  const total = subtotal - discountAmount + shippingCost + tax;
  const amountInCents = Math.round(total * 100);

  const billingAddress: Address = opts.billingAddress ?? {
    ...shippingAddress,
    fullName: shippingAddress.recipientName,
  };
  const orderRef = store.collection(collections.orders).doc();

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amountInCents,
      currency: "usd",
      metadata: { orderId: orderRef.id },
      automatic_payment_methods: { enabled: true },
      receipt_email: opts.email,
    },
    { idempotencyKey: `order-${orderRef.id}` },
  );

  const now = Timestamp.now();

  const orderData: OrderDocument = {
    orderNumber: generateOrderNumber(),
    userId: session?.user.uid ?? null,
    ...(session ? {} : { guestEmail: opts.email }),
    status: "pending",
    statusHistory: [{ status: "pending", timestamp: now }],
    items,
    currency: "usd",
    subtotal,
    discountAmount,
    shippingCost,
    tax,
    total,
    shipping: {
      address: { ...shippingAddress, fullName: shippingAddress.recipientName },
      method: shippingLabel,
      cost: shippingCost,
    },
    billingAddress,
    payment: {
      method: { type: "card" },
      paymentIntentId: paymentIntent.id,
      status: "pending",
    },
    createdAt: now,
    updatedAt: now,
  };

  await orderRef.set(orderData);

  if (opts.saveAddress && session?.user.uid) {
    const saveResult = await addAddress({
      label: "Shipping",
      recipientName: shippingAddress.recipientName,
      phone: shippingAddress.phone,
      line1: shippingAddress.line1,
      line2: shippingAddress.line2 ?? "",
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
      isDefault: false,
    });
    if (!saveResult.success) {
      console.error("Failed to save address from checkout:", saveResult.error);
    }
  }

  return { clientSecret: paymentIntent.client_secret!, orderId: orderRef.id };
}
