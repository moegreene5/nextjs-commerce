import { hasSession } from "@/lib/session";
import { cookies } from "next/headers";
import { cache } from "react";

export const getIsAuthenticated = cache(async () => {
  return !!(await hasSession(await cookies()));
});
