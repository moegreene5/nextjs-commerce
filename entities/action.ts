export type ActionResult =
  | { success: true }
  | { success: false; type: "validation"; fields: Record<string, string[]> }
  | { success: false; type: "auth"; message: string }
  | { success: false; type: "server"; message: string }
  | { success: false; type: "unknown"; message: string };

export const SERVER_ERROR = "Internal server error";
export const GENERIC_LOGIN_ERROR = "Invalid email or password";
