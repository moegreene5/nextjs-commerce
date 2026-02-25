"use server";

import { auth, collections, store } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/mail";
import { createUserSession, deleteUserSession } from "@/lib/session";
import { fugaLoginSchema, LoginFormData } from "@/schema/login.schema";
import { RegisterData, userRegisterSchema } from "@/schema/register.schema";
import {
  forgotPasswordSchema,
  ForgotPasswordSchema,
} from "@/schema/reset.schema";
import { UserRecord } from "firebase-admin/auth";
import { Route } from "next";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

type ActionResult =
  | { success: true }
  | { success: false; type: "validation"; fields: Record<string, string[]> }
  | { success: false; type: "auth"; message: string }
  | { success: false; type: "server"; message: string }
  | { success: false; type: "unknown"; message: string };

const SERVER_ERROR = "Internal server error";
const GENERIC_LOGIN_ERROR = "Invalid email or password";

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
      user_id: firebaseUser.uid,
      name: { first_name: firstName, last_name: lastName },
      email,
      phone_number: phoneNumber,
      billing_address: null,
      username: username || null,
      created_at: new Date(),
      updated_at: new Date(),
      suspended: false,
      verified: false,
      user_type: "user",
    };

    await profileRef.doc(firebaseUser.uid).set(profileData);

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );

    if (!res.ok) {
      return { success: false, type: "server", message: SERVER_ERROR };
    }

    const { idToken } = await res.json();

    if (!idToken) {
      return { success: false, type: "server", message: SERVER_ERROR };
    }

    await createUserSession(idToken, await cookies());
  } catch (err: unknown) {
    if (firebaseUser?.uid) {
      try {
        await auth.deleteUser(firebaseUser.uid);
      } catch (_) {}
    }

    console.error("Register error:", err);
    return { success: false, type: "server", message: SERVER_ERROR };
  }

  redirect("/", RedirectType.replace);
}

export async function logIn(
  data: LoginFormData,
  redirectUrl?: Route,
): Promise<ActionResult> {
  const loginData = fugaLoginSchema.safeParse(data);

  if (!loginData.success) {
    return {
      success: false,
      type: "validation",
      fields: loginData.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = loginData.data;

  try {
    let authUser;
    try {
      authUser = await auth.getUserByEmail(email);
    } catch {
      return { success: false, type: "auth", message: GENERIC_LOGIN_ERROR };
    }

    const profileRef = store.collection(collections.profile);
    const docRef = profileRef.doc(authUser.uid);
    const userProfile = (await docRef.get()).data();

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

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );

    if (!res.ok) {
      const errorBody = await res.json();
      const message = errorBody?.error?.message;

      const isAuthError =
        message === "INVALID_PASSWORD" ||
        message === "EMAIL_NOT_FOUND" ||
        message === "USER_DISABLED";
      return {
        success: false,
        type: "auth",
        message: isAuthError
          ? GENERIC_LOGIN_ERROR
          : message || GENERIC_LOGIN_ERROR,
      };
    }

    const { idToken } = await res.json();

    if (!idToken) {
      return { success: false, type: "server", message: SERVER_ERROR };
    }

    const decoded = await auth.verifyIdToken(idToken);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (nowInSeconds - decoded.auth_time > 5 * 60) {
      return {
        success: false,
        type: "auth",
        message: "Recent sign-in required. Please try again.",
      };
    }

    await createUserSession(idToken, await cookies());
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
  data: ForgotPasswordSchema,
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
