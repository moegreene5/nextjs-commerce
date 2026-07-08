export const FREE_SHIPPING_THRESHOLD = 100;

export const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export type AbsolutePath = `/${string}`;

export function getApiUrl(path: AbsolutePath): URL {
  return new URL(path, BASE_URL);
}
