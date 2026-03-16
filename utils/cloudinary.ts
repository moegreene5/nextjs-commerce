import "server-only";

export async function uploadImage(img: File): Promise<string> {
  const form = new FormData();
  form.append("file", img);
  form.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET!);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: form },
  );

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

export async function deleteImage(url: string): Promise<void> {
  const publicId = url.split("/").pop()?.split(".")[0];
  if (!publicId) return;

  await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        public_id: publicId,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      }),
    },
  );
}

export function optimizeImage(url: string, width = 800) {
  return url.replace("/upload/", `/upload/f_auto,q_auto:best,w_${width}/`);
}
