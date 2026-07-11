import { Timestamp } from "firebase-admin/firestore";

export type AddressDocument = {
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Address = Omit<AddressDocument, "createdAt" | "updatedAt"> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export function toAddress(id: string, data: AddressDocument): Address {
  return {
    ...data,
    id,
    createdAt: data.createdAt.toDate().toISOString(),
    updatedAt: data.updatedAt.toDate().toISOString(),
  };
}
