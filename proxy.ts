import { Route } from "next";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESSION_KEY, getUserFromSession } from "./lib/session";

const ROUTES = {
  public: {
    account: [
      "/account/login",
      "/account/forgot-password",
      "/account/register",
    ],
  },
};

const isPathIn = (path: string, paths: string[]) => paths.includes(path);

const redirectTo = (url: Route, request: NextRequest) => {
  const response = NextResponse.redirect(new URL(url, request.url));
  response.cookies.delete(COOKIE_SESSION_KEY);
  return response;
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicAccountPath = isPathIn(pathname, ROUTES.public.account);
  const isProtectedPath =
    pathname.startsWith("/account") && !isPublicAccountPath;

  const user = await getUserFromSession(request.cookies);

  if (!user) {
    if (isProtectedPath) {
      return redirectTo("/account/login", request);
    }
    return NextResponse.next();
  }

  if (isPublicAccountPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
