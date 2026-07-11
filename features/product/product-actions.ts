"use server";

import { ProductDocument, ProductFilters } from "@/entities/product";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { AppError } from "@/lib/errors";
import { collections, store } from "@/lib/firebase/admin";
import { createProductActionSchema } from "@/schema/product.schema";
import { deleteImage, uploadImage } from "@/utils/cloudinary";
import { randomBytes } from "crypto";
import { Timestamp } from "firebase-admin/firestore";
import { updateTag } from "next/cache";
import { getProducts } from "./product-queries";
import { requireAuth } from "@/lib/auth";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function randomString(length = 6) {
  return randomBytes(length)
    .toString("base64")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase()
    .slice(0, length);
}

function parseForm(form: FormData) {
  const variants: unknown[] = [];
  let i = 0;
  while (form.get(`variants[${i}].size`)) {
    variants.push({
      size: form.get(`variants[${i}].size`),
      price: form.get(`variants[${i}].price`),
      quantityInStore: form.get(`variants[${i}].quantityInStore`),
      sku: form.get(`variants[${i}].sku`) || undefined,
    });
    i++;
  }

  const opt = (key: string) => form.get(key) ?? undefined;
  const saleType = opt("sale.type");

  return {
    name: form.get("name"),
    description: form.get("description"),
    brand: form.get("brand"),
    categoryId: form.get("categoryId"),
    isFeatured: form.get("isFeatured") === "true",
    isBestSeller: form.get("isBestSeller") === "true",
    primaryIndex: Number(form.get("primaryIndex") ?? 0),
    slug: opt("slug"),
    images: form.getAll("image"),
    variants,
    sale: saleType
      ? {
          type: saleType,
          value: opt("sale.value"),
          startDate: opt("sale.startDate"),
          endDate: opt("sale.endDate"),
          label: opt("sale.label"),
        }
      : undefined,
  };
}

export async function createProduct(
  form: FormData,
): Promise<ActionResult<{ id: string; name: string }>> {
  let uploadedUrls: string[] = [];

  try {
    await requireAuth({
      role: "admin",
      forbiddenMessage: "Insuffecient permissions",
    });

    const parsed = createProductActionSchema.safeParse(parseForm(form));

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(" · "),
      };
    }

    const data = parsed.data;
    const primaryIndex = data.primaryIndex;
    const files = data.images;

    const categoryRef = store.doc(
      `${collections.categories}/${data.categoryId}`,
    );
    const categorySnap = await categoryRef.get();
    if (!categorySnap.exists) {
      return { success: false, error: "Category not found" };
    }

    const categoryName: string = categorySnap.data()?.name ?? "";
    const categoryStep: number | null = categorySnap.data()?.step ?? null;

    const baseSlug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    const slug = `${baseSlug}-${randomString(6)}`;

    const productRef = store.collection(collections.products).doc(slug);

    let sale;
    if (data.sale) {
      const startMs = Date.parse(data.sale.startDate);
      const endMs = Date.parse(data.sale.endDate);
      if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
        return { success: false, error: "Invalid sale date" };
      }
      sale = {
        type: data.sale.type,
        value: Number(data.sale.value),
        startDate: Timestamp.fromMillis(startMs),
        endDate: Timestamp.fromMillis(endMs),
        ...(data.sale.label && { label: data.sale.label }),
      };
    }

    const results = await Promise.allSettled(files.map(uploadImage));

    const failures = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );

    uploadedUrls = results
      .filter(
        (r): r is PromiseFulfilledResult<string> => r.status === "fulfilled",
      )
      .map((r) => r.value);

    if (failures.length > 0) {
      failures.forEach((f, i) =>
        console.error(`[createProduct] image upload ${i} failed:`, f.reason),
      );
      throw new AppError(
        `${failures.length} of ${files.length} image(s) failed to upload`,
        "UPLOAD_FAILED",
      );
    }

    const unsorted = uploadedUrls.map((url, i) => ({
      url,
      isPrimary: i === primaryIndex,
    }));

    const images = [
      ...unsorted.filter((img) => img.isPrimary),
      ...unsorted.filter((img) => !img.isPrimary),
    ];

    const doc: ProductDocument = {
      slug,
      name: data.name,
      description: data.description,
      brand: data.brand,
      category: categoryRef,
      categoryName,
      categoryStep,
      images,
      variants: data.variants.map((v, i) => ({
        id: `${slug}-variant-${i}`,
        size: v.size,
        price: v.price,
        quantityInStore: v.quantityInStore,
        ...(v.sku && { sku: v.sku }),
      })),
      isFeatured: data.isFeatured,
      isBestSeller: data.isBestSeller,
      ...(sale && { sale }),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    try {
      await productRef.create(doc);
    } catch (err: any) {
      if (err.code === 6) {
        throw new AppError("Product already exists", "SLUG_CONFLICT");
      }
      throw err;
    }

    if (data.isFeatured) updateTag(CACHE_TAGS.featuredProducts);
    if (data.isBestSeller) updateTag(CACHE_TAGS.bestSellers);
    updateTag(CACHE_TAGS.relatedProducts);
    updateTag(CACHE_TAGS.allProducts);

    return { success: true, data: { id: productRef.id, name: data.name } };
  } catch (err) {
    console.error("[createProduct]", err);

    if (uploadedUrls.length > 0) {
      await Promise.allSettled(uploadedUrls.map(deleteImage));
    }

    const error =
      err instanceof AppError
        ? err.message
        : "Something went wrong. Please try again.";

    return { success: false, error };
  }
}

export async function deleteProducts(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Array of product ids required");
  }

  const docs = await Promise.all(
    ids.map((id) => store.collection(collections.products).doc(id).get()),
  );

  const batch = store.batch();
  docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  const allImageUrls = docs.flatMap((doc) =>
    (doc.data()?.images ?? []).map((img: { url: string }) => img.url),
  );
  if (allImageUrls.length > 0) {
    await Promise.allSettled(allImageUrls.map(deleteImage));
  }

  const hasFeatured = docs.some((doc) => doc.data()?.isFeatured);
  const hasBestSeller = docs.some((doc) => doc.data()?.isBestSeller);

  if (hasFeatured) updateTag(CACHE_TAGS.featuredProducts);
  if (hasBestSeller) updateTag(CACHE_TAGS.bestSellers);

  return { deleted: ids.length };
}

export async function getProductAction(filters: ProductFilters) {
  return getProducts(filters);
}
