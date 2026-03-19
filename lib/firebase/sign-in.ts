import { GENERIC_LOGIN_ERROR, SERVER_ERROR } from "@/entities/action";
import { auth } from "@/lib/firebase/admin";

type SignInResult =
  | { success: true; idToken: string; uid: string }
  | { success: false; message: string };

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<SignInResult> {
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
      message === "USER_DISABLED" ||
      message === "INVALID_LOGIN_CREDENTIALS";

    if (message === "TOO_MANY_ATTEMPTS_TRY_LATER") {
      return {
        success: false,
        message: "Too many attempts. Please try again later.",
      };
    }

    return {
      success: false,
      message: isAuthError
        ? GENERIC_LOGIN_ERROR
        : message || GENERIC_LOGIN_ERROR,
    };
  }

  const { idToken } = await res.json();

  if (!idToken) {
    return { success: false, message: SERVER_ERROR };
  }

  const decoded = await auth.verifyIdToken(idToken);
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (nowInSeconds - decoded.auth_time > 5 * 60) {
    return {
      success: false,
      message: "Recent sign-in required. Please try again.",
    };
  }

  return { success: true, idToken, uid: decoded.uid };
}
