import { Profile } from "@/entities/user";
import { Timestamp } from "firebase-admin/firestore";

export function normalizeProfileDoc(
  data: FirebaseFirestore.DocumentData,
): Profile {
  const toISO = (val: unknown): string =>
    val instanceof Timestamp ? val.toDate().toISOString() : String(val ?? "");

  return {
    userId: data.userId ?? "",
    email: data.email ?? "",
    name: {
      firstName: data.name?.firstName ?? "",
      lastName: data.name?.lastName ?? "",
    },
    phoneNumber: data.phoneNumber ?? "",
    userName: data.userName ?? "",
    emailVerified: data.emailVerified ?? false,
    userType: data.userType ?? "user",
    isSuspended: data.isSuspended ?? false,
    cartId: data.cartId ?? undefined,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  };
}
