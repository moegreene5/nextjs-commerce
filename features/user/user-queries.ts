import "server-only";

import { collections, store } from "@/lib/firebase/admin";
import { getUserFromSession } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { IProfile } from "@/types";

export type User = Exclude<
  Awaited<ReturnType<typeof getUserFromSession>>,
  undefined | null
>;

async function getUserProfile(userId: string) {
  const profileRef = store.collection(collections.profile);
  const docRef = profileRef.doc(userId);

  return (await docRef.get()).data();
}

function _getCurrentUser(options: {
  withFullUser: true;
  redirectIfNotFound: true;
}): Promise<IProfile>;
function _getCurrentUser(options: {
  withFullUser: true;
  redirectIfNotFound?: false;
}): Promise<IProfile | null>;
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
  const user = await getUserFromSession(await cookies());

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
