"use server";

import { ActionResult, SERVER_ERROR } from "@/entities/action";
import { auth, store } from "@/lib/firebase/admin";
import { signInWithEmailPassword } from "@/lib/firebase/sign-in";
import { getUserFromSession } from "@/lib/session";
import { RegisterData, userRegisterSchema } from "@/schema/register.schema";
import { refresh } from "next/cache";
import { cookies } from "next/headers";

export async function updateUserProfile(
  data: RegisterData,
): Promise<ActionResult> {
  const parsed = userRegisterSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      type: "validation",
      fields: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password, firstName, lastName, phoneNumber, username } =
    parsed.data;

  try {
    const cookieStore = await cookies();
    const session = await getUserFromSession(cookieStore);

    if (!session) {
      return { success: false, type: "auth", message: "Unauthorized" };
    }

    const uid = session.user.uid;
    const currentEmail = session.user.email as string;

    const signIn = await signInWithEmailPassword(currentEmail, password);

    if (!signIn.success) {
      return {
        success: false,
        type: "validation",
        fields: { password: ["Incorrect password"] },
      };
    }

    const emailChanged = email !== currentEmail;
    const nameChanged = `${firstName} ${lastName}` !== session.user.displayName;

    if (emailChanged || nameChanged) {
      await auth.updateUser(uid, {
        ...(nameChanged ? { displayName: `${firstName} ${lastName}` } : {}),
        ...(emailChanged ? { email } : {}),
      });
    }

    await store
      .collection("profile")
      .doc(uid)
      .update({
        email,
        name: { firstName, lastName },
        phoneNumber,
        userName: username || null,
        updatedAt: new Date(),
      });

    refresh();
    return { success: true };
  } catch (err: unknown) {
    console.error("Update profile error:", err);
    return { success: false, type: "server", message: SERVER_ERROR };
  }
}
