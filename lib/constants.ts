export const FREE_SHIPPING_THRESHOLD = 100;

export const BASE_URL = (() => {
  if (typeof window !== "undefined") {
    return "";
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
})();

export type AbsolutePath = `/${string}`;

export function getApiUrl(path: AbsolutePath): URL {
  if (typeof window !== "undefined") {
    return new URL(path, window.location.origin);
  }
  return new URL(path, BASE_URL);
}
