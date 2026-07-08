import "server-only";

import { collections, store } from "@/lib/firebase/admin";

export async function getUserOrders(userId: string) {
  if (!userId || typeof userId !== "string") return [];

  const orderRef = store
    .collection(collections.orders)
    .where("userId", "==", userId);

  const snap = await orderRef.get();
}
