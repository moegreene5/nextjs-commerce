import "server-only";

import { randomUUID } from "crypto";
import { auth } from "./firebase/admin";

const SESSION_EXPIRATION_SECONDS = 7 * 60 * 60 * 24;
export const COOKIE_SESSION_KEY = "app-session";
export const COOKIE_GUEST_ID_KEY = "guest-id";

export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      expires?: number;
      maxAge?: number;
      path?: string;
    },
  ) => void;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
};

const setCookie = (
  sessionId: string,
  cookies: Pick<Cookies, "set" | "delete">,
) => {
  cookies.set(COOKIE_SESSION_KEY, sessionId, {
    sameSite: "lax",
    httpOnly: true,
    secure: true,
    expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
    maxAge: SESSION_EXPIRATION_SECONDS,
    path: "/",
  });
};

export const createUserSession = async (idToken: string, cookie: Cookies) => {
  const sessionId = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRATION_SECONDS * 1000,
  });

  setCookie(sessionId, cookie);
};

export const hasSession = async (cookies: Pick<Cookies, "get">) => {
  return !!cookies.get(COOKIE_SESSION_KEY)?.value;
};

export const getUserFromSession = async (
  cookies: Pick<Cookies, "get" | "delete">,
  checkRevoked: boolean = true,
) => {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (!sessionId) return null;

  return getUserSessionById(sessionId, checkRevoked);
};

export async function getUserSessionById(
  sessionId: string,
  checkRevoked: boolean,
) {
  try {
    const decodedClaims = await auth.verifySessionCookie(
      sessionId,
      checkRevoked,
    );

    const user = await auth.getUser(decodedClaims.uid);

    return { user, claims: decodedClaims };
  } catch (error) {
    console.warn("Session verification failed, clearing cookie", error);
    return null;
  }
}

export async function deleteUserSession(cookies: Pick<Cookies, "delete">) {
  cookies.delete(COOKIE_SESSION_KEY);
}

export const getOrCreateGuestId = (cookies: Cookies): string => {
  const existing = cookies.get(COOKIE_GUEST_ID_KEY)?.value;
  if (existing) return existing;

  const guestId = randomUUID();
  cookies.set(COOKIE_GUEST_ID_KEY, guestId, {
    sameSite: "lax",
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return guestId;
};

export const getGuestId = (cookies: Pick<Cookies, "get">): string | null => {
  return cookies.get(COOKIE_GUEST_ID_KEY)?.value ?? null;
};

export const clearGuestSession = (cookies: Pick<Cookies, "delete">) =>
  cookies.delete(COOKIE_GUEST_ID_KEY);
