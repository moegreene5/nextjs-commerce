import { DocumentReference } from "firebase-admin/firestore";

interface ITimestamp {
  created_at: Date;
  updated_at: Date;
}

export interface IProfile extends ITimestamp {
  user_id: string;
  email: string;
  name: {
    first_name: string;
    last_name: string;
  };
  phone_number: string;
  username: string | null;
  business_name: string | null;
  business_address: string | null;
  instagram_name: string | null;
  verified: boolean;
  billing_address: string | null;
  user_type: "user" | "admin";
}

export interface IProduct extends ITimestamp {
  name: string;
  image: string[];
  description: string;
  category: DocumentReference;
  segment?: DocumentReference | null;
  size: string;
  brand: string;
  brandCategory: DocumentReference;
  minimumItemsToPurchase: number;
  price: number;
  out_of_stock: boolean;
  quantityInStore: number | null;
}

export interface ICategory extends ITimestamp {
  name: string;
}

export interface ISegment extends ICategory {}
export interface IBrandCategory extends ICategory {}

export interface ICart extends ITimestamp {
  product_id: DocumentReference;
  quantity: number;
}

export interface IOrder extends ITimestamp {
  items: any;
  totalAmount: number;
  isAvailableForPickup: "available" | "notAvailable";
  orderStatus: "pending" | "completed" | "canceled" | "refunded";
  paymentStatus: "pending" | "successful" | "failed";
  paymentDetails: {
    paymentMethod: "paystack" | "bank_transfer";
    transactionReference: string | null;
  };
  billingAddress: {
    country: string;
    firstName: string;
    lastName: string;
    address: string;
    apartment: string | null;
    city: string;
    state: string;
    postalCode: string | null;
    phone: string | number | null;
  };
  user_id: DocumentReference;
}

export interface IStorePurchase extends ITimestamp {
  items: any;
  totalAmount: number;
  saveOnly: boolean;
  totalItemsPurchased: number;
  totalQuantityOfItemsPurchased: number;
  paymentDetails: {
    paymentMethod: string;
    paymentStatus: "successful";
  };
  customer: {
    name: string;
    phone: string;
    address: string;
  };
}

export class BodyError extends Error {
  code;
  statusCode;
  constructor(
    message: string,
    code: string = "bodyError",
    statusCode?: number,
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode || 400;
  }
}
