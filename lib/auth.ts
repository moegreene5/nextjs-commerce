import "server-only";

import { Profile } from "@/entities/user";
import { DecodedIdToken, UserRecord } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { AppError } from "./errors";
import { getUserFromSession } from "./session";

type RequireAuthOptions = {
  role?: Profile["userType"];
  unauthenticatedMessage?: string;
  forbiddenMessage?: string;
};

export async function requireAuth(
  options: RequireAuthOptions = {},
): Promise<{ uid: string; claims: DecodedIdToken; user: UserRecord }> {
  const {
    role = "user",
    unauthenticatedMessage = "Not authenticated",
    forbiddenMessage = "You don't have permission to do that",
  } = options;

  const cookieStore = await cookies();
  const session = await getUserFromSession(cookieStore);

  if (!session) {
    throw new AppError(unauthenticatedMessage, "UNAUTHORIZED");
  }

  if (role === "admin" && session.claims?.role !== "admin") {
    throw new AppError(forbiddenMessage, "FORBIDDEN");
  }

  return { uid: session.user.uid, claims: session.claims, user: session.user };
}
