import { Timestamp } from "firebase-admin/firestore";

// ── Shared sub-types ──────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: Timestamp;
  note?: string;
}

export interface OrderLineItem {
  // References — best-effort, may point to nothing if product/variant later removed
  productId: string;
  variantId: string;

  // Snapshot — frozen at checkout, always valid regardless of product's current state
  name: string;
  slug: string; // for "view product" link attempt; may 404
  image: string;
  size: string;
  sku: string;
  unitPrice: number; // price actually paid, not current price
  quantity: number;
  lineTotal: number; // unitPrice * quantity, computed once at checkout
}

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2, e.g. "NG"
  phone?: string;
}

export interface ShippingInfo {
  address: Address; // snapshot, not a ref to user's saved address book
  method: string; // "standard" | "express" | carrier-specific label
  cost: number;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Timestamp;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
}

export interface PaymentInfo {
  method: { type: string; last4?: string }; // never raw card data
  paymentIntentId: string; // reference to processor record (Stripe, etc.)
  status: PaymentStatus;
  paidAt?: Timestamp;
  refundedAmount?: number;
}

// ── Main order document ───────────────────────────────────

export interface OrderDocument {
  // Identity
  orderNumber: string; // human-facing, e.g. "ORD-2026-00123"
  userId: string | null; // null for guest checkout
  guestEmail?: string; // required if userId is null

  // Status
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  cancelledAt?: Timestamp;
  cancelReason?: string;

  items: OrderLineItem[];

  currency: string;
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingCost: number;
  tax: number;
  total: number;

  shipping: ShippingInfo;
  billingAddress: Address;

  payment: PaymentInfo;

  metadata?: Record<string, string>;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
