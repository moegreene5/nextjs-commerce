"use server";

import { Address, AddressDocument, toAddress } from "@/entities/address";
import { requireAuth } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { AppError } from "@/lib/errors";
import { collections, store } from "@/lib/firebase/admin";
import {
  AddAddressInput,
  addressSchema,
  UpdateAddressInput,
  updateAddressSchema,
} from "@/schema/address.schema";
import { Timestamp } from "firebase-admin/firestore";
import { Route } from "next";
import { revalidatePath, updateTag } from "next/cache";

const MAX_ADDRESSES = 4;

export type AddressResult =
  | { success: true; address: Address }
  | { success: false; error: string };

export type SimpleResult =
  | { success: true }
  | { success: false; error: string };

export async function addAddress(
  input: AddAddressInput,
): Promise<AddressResult> {
  try {
    const { uid } = await requireAuth({
      unauthenticatedMessage: "Sign in to save an address",
    });

    const result = addressSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const ref = store.collection(collections.addresses);
    const now = Timestamp.now();

    const address = await store.runTransaction(async (tx) => {
      const existing = await tx.get(ref.where("userId", "==", uid));

      if (existing.size >= MAX_ADDRESSES) {
        throw new AppError(
          `You can only save up to ${MAX_ADDRESSES} addresses`,
          "LIMIT_REACHED",
        );
      }

      const isFirst = existing.empty;
      const shouldBeDefault = isFirst || result.data.isDefault;

      if (shouldBeDefault && !isFirst) {
        existing.docs.forEach((doc) => {
          if (doc.data().isDefault) tx.update(doc.ref, { isDefault: false });
        });
      }

      const newDoc = ref.doc();
      const data: AddressDocument = {
        ...result.data,
        userId: uid,
        isDefault: shouldBeDefault,
        createdAt: now,
        updatedAt: now,
      };
      tx.set(newDoc, data);

      return toAddress(newDoc.id, data);
    });

    updateTag(CACHE_TAGS.addresses(uid));
    revalidatePath("/account/addresses" as Route);
    return { success: true, address };
  } catch (error) {
    if (error instanceof AppError)
      return { success: false, error: error.message };
    console.error("addAddress error:", error);
    return { success: false, error: "Failed to add address" };
  }
}

export async function updateAddress(
  input: UpdateAddressInput,
): Promise<AddressResult> {
  try {
    const { uid } = await requireAuth({
      unauthenticatedMessage: "Sign in to update your address",
    });

    const result = updateAddressSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { addressId, ...updates } = result.data;
    const ref = store.collection(collections.addresses).doc(addressId);
    const now = Timestamp.now();

    const address = await store.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      if (!doc.exists || doc.data()?.userId !== uid) {
        throw new AppError("Address not found", "NOT_FOUND");
      }

      if (updates.isDefault) {
        const others = await tx.get(
          store.collection(collections.addresses).where("userId", "==", uid),
        );
        others.docs.forEach((d) => {
          if (d.id !== addressId && d.data().isDefault) {
            tx.update(d.ref, { isDefault: false });
          }
        });
      }

      tx.update(ref, { ...updates, updatedAt: now });
      const merged = {
        ...doc.data(),
        ...updates,
        updatedAt: now,
      } as AddressDocument;
      return toAddress(addressId, merged);
    });

    updateTag(CACHE_TAGS.addresses(uid));
    revalidatePath("/account/addresses" as Route);
    return { success: true, address };
  } catch (error) {
    if (error instanceof AppError)
      return { success: false, error: error.message };
    console.error("updateAddress error:", error);
    return { success: false, error: "Failed to update address" };
  }
}

export async function setDefaultAddress(
  addressId: string,
): Promise<SimpleResult> {
  try {
    const { uid } = await requireAuth({
      unauthenticatedMessage: "Sign in to update your address",
    });

    const ref = store.collection(collections.addresses);

    await store.runTransaction(async (tx) => {
      const target = await tx.get(ref.doc(addressId));
      if (!target.exists || target.data()?.userId !== uid) {
        throw new AppError("Address not found", "NOT_FOUND");
      }

      const all = await tx.get(ref.where("userId", "==", uid));
      all.docs.forEach((d) => {
        tx.update(d.ref, { isDefault: d.id === addressId });
      });
    });

    updateTag(CACHE_TAGS.addresses(uid));
    revalidatePath("/account/addresses" as Route);
    return { success: true };
  } catch (error) {
    if (error instanceof AppError)
      return { success: false, error: error.message };
    console.error("setDefaultAddress error:", error);
    return { success: false, error: "Failed to set default address" };
  }
}

export async function removeAddress(addressId: string): Promise<SimpleResult> {
  try {
    const { uid } = await requireAuth({
      unauthenticatedMessage: "Sign in to remove an address",
    });

    const ref = store.collection(collections.addresses).doc(addressId);
    const doc = await ref.get();

    if (!doc.exists || doc.data()?.userId !== uid) {
      throw new AppError("Address not found", "NOT_FOUND");
    }

    await ref.delete();

    updateTag(CACHE_TAGS.addresses(uid));
    revalidatePath("/account/addresses" as Route);
    return { success: true };
  } catch (error) {
    if (error instanceof AppError)
      return { success: false, error: error.message };
    console.error("removeAddress error:", error);
    return { success: false, error: "Failed to remove address" };
  }
}
