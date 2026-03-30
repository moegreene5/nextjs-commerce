import "server-only";

import { getUserFromSession } from "@/lib/session";
import { cookies } from "next/headers";
import { cache } from "react";

export const getIsAuthenticated = cache(async () => {
  const cookieStore = await cookies();

  const session = await getUserFromSession(cookieStore);
  return !!session;
});
