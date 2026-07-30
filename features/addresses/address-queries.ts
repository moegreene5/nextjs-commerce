import "server-only";

import { Address, AddressDocument, toAddress } from "@/entities/address";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { collections, store } from "@/lib/firebase/admin";
import { cacheLife, cacheTag } from "next/cache";
import { getCurrentUser } from "../user/user-queries";

export async function getAddresses(): Promise<Address[]> {
  const session = await getCurrentUser();

  const uid = session?.user?.uid;

  if (!uid) {
    return [];
  }

  return getCachedAddresses(uid);
}

async function getCachedAddresses(uid: string): Promise<Address[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.addresses(uid));

  const snap = await store
    .collection(collections.addresses)
    .where("userId", "==", uid)
    .orderBy("isDefault", "desc")
    .orderBy("createdAt", "asc")
    .get();

  return snap.docs.map((d) => toAddress(d.id, d.data() as AddressDocument));
}
