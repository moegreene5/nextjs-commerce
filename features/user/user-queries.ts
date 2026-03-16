import "server-only";

import { Profile } from "@/entities/user";
import { collections, store } from "@/lib/firebase/admin";
import { getUserFromSession } from "@/lib/session";
import { normalizeProfileDoc } from "@/lib/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export type User = Exclude<
  Awaited<ReturnType<typeof getUserFromSession>>,
  undefined | null
>;

async function getUserProfile(userId: string): Promise<Profile | null> {
  const docSnap = await store.collection(collections.profile).doc(userId).get();

  if (!docSnap.exists) return null;
  return normalizeProfileDoc(docSnap.data()!);
}

function _getCurrentUser(options: {
  withFullUser: true;
  redirectIfNotFound: true;
}): Promise<Profile>;
function _getCurrentUser(options: {
  withFullUser: true;
  redirectIfNotFound?: false;
}): Promise<Profile | null>;
function _getCurrentUser(options: {
  withFullUser?: false;
  redirectIfNotFound: true;
}): Promise<User>;
function _getCurrentUser(options?: {
  withFullUser?: false;
  redirectIfNotFound?: false;
}): Promise<User | null>;

async function _getCurrentUser({
  withFullUser = false,
  redirectIfNotFound = false,
} = {}) {
  const cookieStore = await cookies();
  const user = await getUserFromSession(cookieStore);

  if (user == null) {
    if (redirectIfNotFound) return redirect("/account/login");
    return null;
  }

  if (withFullUser) {
    const fullUser = await getUserProfile(user.user.uid);
    // This should never happen
    if (fullUser == null) return null;

    return fullUser;
  }

  return user;
}

export const getCurrentUser = cache(_getCurrentUser);
