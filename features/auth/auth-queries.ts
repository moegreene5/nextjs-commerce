import "server-only";

import { getUserFromSession } from "@/lib/session";
import { cookies } from "next/headers";
import { cache } from "react";

export const getIsAuthenticated = cache(async () => {
  const session = await getUserFromSession(await cookies());
  return !!session;
});
