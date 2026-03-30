"use server";

import {
  ActionResult,
  GENERIC_LOGIN_ERROR,
  SERVER_ERROR,
} from "@/entities/action";
import { Profile } from "@/entities/user";
import { auth, collections, store } from "@/lib/firebase/admin";
import { signInWithEmailPassword } from "@/lib/firebase/sign-in";
import { sendEmail } from "@/lib/mail";
import {
  createUserSession,
  deleteUserSession,
  getUserFromSession,
} from "@/lib/session";
import {
  ChangePasswordInput,
  changePasswordSchema,
} from "@/schema/changePassword.schema";
import { LoginFormData, loginSchema } from "@/schema/login.schema";
import { RegisterData, userRegisterSchema } from "@/schema/register.schema";
import { ForgotPassword, forgotPasswordSchema } from "@/schema/reset.schema";
import { UserRecord } from "firebase-admin/auth";
import { Route } from "next";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { associateCartWithUser } from "../cart/cart-actions";

export async function registerCustomer(
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

  const profileRef = store.collection("profile");
  let firebaseUser: UserRecord | undefined;
  let signInResult: Awaited<ReturnType<typeof signInWithEmailPassword>> | null =
    null;

  try {
    const existing = await profileRef.where("email", "==", email).get();
    if (!existing.empty) {
      return {
        success: false,
        type: "validation",
        fields: { email: ["An account with this email already exists"] },
      };
    }

    firebaseUser = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    await auth.setCustomUserClaims(firebaseUser.uid, { role: "user" });

    const profileData = {
      userId: firebaseUser.uid,
      name: { firstName, lastName },
      email,
      phoneNumber,
      userName: username || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isSuspended: false,
      emailVerified: false,
      userType: "user",
    };

    await profileRef.doc(firebaseUser.uid).set(profileData);

    signInResult = await signInWithEmailPassword(email, password);
  } catch (err: unknown) {
    if (firebaseUser?.uid) {
      try {
        await auth.deleteUser(firebaseUser.uid);
      } catch (_) {}
    }

    console.error("Register error:", err);
    return { success: false, type: "server", message: SERVER_ERROR };
  }

  if (!signInResult?.success) {
    redirect("/account/login?reason=registered", RedirectType.replace);
  }

  await associateCartWithUser(signInResult.uid);
  await createUserSession(signInResult.idToken, await cookies());

  redirect("/", RedirectType.replace);
}

export async function logIn(
  data: LoginFormData,
  redirectUrl?: Route,
): Promise<ActionResult> {
  const loginData = loginSchema.safeParse(data);

  if (!loginData.success) {
    return {
      success: false,
      type: "validation",
      fields: loginData.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = loginData.data;

  try {
    const signIn = await signInWithEmailPassword(email, password);

    if (!signIn.success) {
      return { success: false, type: "auth", message: signIn.message };
    }

    const userProfile = (
      await store.collection(collections.profile).doc(signIn.uid).get()
    ).data() as Profile;

    if (!userProfile) {
      return { success: false, type: "auth", message: GENERIC_LOGIN_ERROR };
    }

    if (userProfile.isSuspended) {
      return {
        success: false,
        type: "auth",
        message: "Account suspended. Please contact support.",
      };
    }

    await associateCartWithUser(signIn.uid);
    await createUserSession(signIn.idToken, await cookies());
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, type: "server", message: SERVER_ERROR };
  }

  redirect((redirectUrl || "/") as Route, RedirectType.replace);
}

export async function logOut() {
  await deleteUserSession(await cookies());
}

export const sendResetPasswordEmail = async (
  data: ForgotPassword,
): Promise<ActionResult> => {
  const parsed = forgotPasswordSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      type: "validation",
      fields: parsed.error.flatten().fieldErrors,
    };
  }

  const { email } = parsed.data;

  let resetLink: string;

  try {
    resetLink = await auth.generatePasswordResetLink(email);
  } catch (error: any) {
    if (error?.code === "auth/user-not-found") {
      return { success: true };
    }
    console.error("[sendResetPasswordEmail] Failed to generate link:", error);
    return {
      success: false,
      type: "unknown",
      message: "Failed to generate reset link. Please try again.",
    };
  }

  try {
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>We received a request to reset the password for your account.</p>
          <a
            href="${resetLink}"
            style="display:inline-block;margin-top:16px;padding:12px 24px;background:#000;color:#fff;text-decoration:none;font-weight:bold;"
          >
            Reset Password
          </a>
          <p style="margin-top:24px;color:#666;font-size:13px;">
            If you didn't request this, you can safely ignore this email.
            This link expires in 1 hour.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[sendResetPasswordEmail] Failed to send email:", error);
    return {
      success: false,
      type: "unknown",
      message: "Failed to send reset email. Please try again.",
    };
  }

  return { success: true };
};

export async function ChangePassword(
  input: ChangePasswordInput,
): Promise<ActionResult> {
  const session = await getUserFromSession(await cookies());
  if (!session?.user.uid) {
    return {
      success: false,
      message: "Unauthorized access denied",
      type: "auth",
    };
  }

  const { email, uid: userId } = session.user;

  const inputValidation = changePasswordSchema.safeParse(input);

  if (!inputValidation.success) {
    return {
      success: false,
      type: "validation",
      fields: inputValidation.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = inputValidation.data;

  try {
    const verify = await signInWithEmailPassword(email!, currentPassword);

    if (!verify.success) {
      if (verify.message.includes("Too many attempts")) {
        return { success: false, type: "server", message: verify.message };
      }
      return {
        success: false,
        type: "validation",
        fields: { currentPassword: ["Incorrect password"] },
      };
    }

    await auth.updateUser(userId, { password: newPassword });
    await auth.revokeRefreshTokens(userId);
    await logOut();
  } catch (error) {
    console.error("[ChangePassword]", error);
    return {
      success: false,
      type: "server",
      message: "An unexpected error occurred. Please try again.",
    };
  }

  redirect("/account/login");
}

type RevokeSessionsResult = Exclude<
  ActionResult,
  { success: false; type: "validation" } | { success: true }
>;

export async function revokeAllSessions(): Promise<RevokeSessionsResult> {
  try {
    const session = await getUserFromSession(await cookies());

    if (!session || !session.user.uid) {
      return {
        success: false,
        type: "auth",
        message: "Unauthorized access denied",
      };
    }

    await auth.revokeRefreshTokens(session.user.uid);
    await logOut();
  } catch (error) {
    console.error("[revokeAllSessions]", error);
    return {
      success: false,
      type: "server",
      message: "Something went wrong. Please try again.",
    };
  }

  redirect("/account/login");
}
