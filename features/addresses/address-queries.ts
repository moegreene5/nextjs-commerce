import "server-only";

import { Address, AddressDocument, toAddress } from "@/entities/address";
import { requireAuth } from "@/lib/auth";
import { collections, store } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";

export async function getAddresses(): Promise<Address[]> {
  const { uid } = await requireAuth({
    unauthenticatedMessage: "Sign in to view your addresses",
  }).catch(() => {
    redirect("/account/login?reason=addresses");
  });

  const snap = await store
    .collection(collections.addresses)
    .where("userId", "==", uid)
    .orderBy("isDefault", "desc")
    .orderBy("createdAt", "asc")
    .get();

  return snap.docs.map((d) => toAddress(d.id, d.data() as AddressDocument));
}
