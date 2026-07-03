import "server-only";

import crypto from "crypto";

function getPublicId(url: string): string | null {
  return url.split("/").pop()?.split(".")[0] ?? null;
}

export async function uploadImage(img: File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary env vars not configured");
  }

  const form = new FormData();
  form.append("file", img);
  form.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form, signal: AbortSignal.timeout(30_000) },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("[uploadImage] Cloudinary HTTP error:", res.status, text);
    throw new Error(`Cloudinary upload failed (${res.status})`);
  }

  const data = await res.json();

  if (!data.secure_url) {
    console.error(
      "[uploadImage] Cloudinary error:",
      JSON.stringify(data, null, 2),
    );
    throw new Error(data.error?.message ?? "Cloudinary upload failed");
  }

  return data.secure_url;
}

function generateSignature(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(sorted + apiSecret)
    .digest("hex");
}

export async function deleteImage(url: string): Promise<void> {
  const publicId = getPublicId(url);
  if (!publicId) {
    console.error("[deleteImage] Could not extract public_id from:", url);
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("[deleteImage] Missing Cloudinary env vars");
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);

  const signature = generateSignature(
    { public_id: publicId, timestamp },
    apiSecret,
  );

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          public_id: publicId,
          timestamp: String(timestamp),
          api_key: apiKey,
          signature,
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.error(
        "[deleteImage] Cloudinary HTTP error:",
        publicId,
        res.status,
        text,
      );
      return;
    }
    const data = await res.json();

    if (data.result !== "ok") {
      console.error("[deleteImage] Cloudinary delete failed:", publicId, data);
    }
  } catch (err) {
    console.error("[deleteImage] Request failed:", publicId, err);
  }
}

export function optimizeImage(url: string, width = 800) {
  return url.replace("/upload/", `/upload/w_${width}/`);
}
