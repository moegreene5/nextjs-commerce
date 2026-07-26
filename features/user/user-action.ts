"use server";

import { ActionResult, SERVER_ERROR } from "@/entities/action";
import { requireAuth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { auth, collections, store } from "@/lib/firebase/admin";
import { signInWithEmailPassword } from "@/lib/firebase/sign-in";
import { ProfileData, userProfileSchema } from "@/schema/register.schema";
import { Route } from "next";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(
  data: ProfileData,
): Promise<ActionResult> {
  const parsed = userProfileSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      type: "validation",
      fields: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { password, firstName, lastName, phoneNumber, username } = parsed.data;

  try {
    const { user } = await requireAuth({
      unauthenticatedMessage: "Unauthorized",
    });

    const uid = user.uid;
    const currentEmail = user.email as string;

    const signIn = await signInWithEmailPassword(currentEmail, password);

    if (!signIn.success) {
      return {
        success: false,
        type: "validation",
        fields: { password: ["Incorrect password"] },
      };
    }

    const nameChanged = `${firstName} ${lastName}` !== user.displayName;

    if (nameChanged) {
      await auth.updateUser(uid, {
        displayName: `${firstName} ${lastName}`,
      });
    }

    await store
      .collection(collections.profile)
      .doc(uid)
      .update({
        name: { firstName, lastName },
        phoneNumber,
        userName: username || null,
        updatedAt: new Date(),
      });

    revalidatePath("/account" as Route);
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, type: "auth", message: err.message };
    }
    console.error("Update profile error:", err);
    return { success: false, type: "server", message: SERVER_ERROR };
  }
}
