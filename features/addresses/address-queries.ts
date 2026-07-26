import "server-only";

import { Address, AddressDocument, toAddress } from "@/entities/address";
import { collections, store } from "@/lib/firebase/admin";
import { getCurrentUser } from "../user/user-queries";

export async function getAddresses(): Promise<Address[]> {
  const session = await getCurrentUser();

  const uid = session?.user?.uid;

  if (!uid) {
    return [];
  }

  const snap = await store
    .collection(collections.addresses)
    .where("userId", "==", uid)
    .orderBy("isDefault", "desc")
    .orderBy("createdAt", "asc")
    .get();

  return snap.docs.map((d) => toAddress(d.id, d.data() as AddressDocument));
}
