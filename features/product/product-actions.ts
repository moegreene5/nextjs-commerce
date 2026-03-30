"use server";

import { ProductDocument, ProductFilters } from "@/entities/product";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { collections, store } from "@/lib/firebase/admin";
import { getUserFromSession } from "@/lib/session";
import {
  createProductActionSchema,
  imagesSchema,
} from "@/schema/product.schema";
import { deleteImage, uploadImage } from "@/utils/cloudinary";
import { randomBytes } from "crypto";
import { Timestamp } from "firebase-admin/firestore";
import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { getProducts } from "./product-queries";
import { PAGE_SIZE } from "./search-params";

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

// async function uploadImage(img: File): Promise<string> {
//   const buffer = Buffer.from(await img.arrayBuffer());
//   const fileName = `${collections.product}/${new Date().toISOString()}-${
//     img.name
//   }`;
//   const fileRef = storage.bucket().file(fileName);
//   await fileRef.save(buffer);
//   return getDownloadURL(fileRef);
// }

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
  const cookieStore = await cookies();
  const session = await getUserFromSession(cookieStore);

  if (!session) {
    return { success: false, error: "Not Authorized." };
  }

  if (session.claims.role !== "admin") {
    return { success: false, error: "Insufficient permissions" };
  }

  let uploadedUrls: string[] = [];

  try {
    const parsed = createProductActionSchema.safeParse(parseForm(form));
    const primaryIndex = Number(form.get("primaryIndex") ?? 0);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(" · "),
      };
    }

    const data = parsed.data;

    const files = form.getAll("image") as File[];
    const imagesResult = imagesSchema.safeParse(files);
    if (!imagesResult.success) {
      return { success: false, error: imagesResult.error.issues[0].message };
    }

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
    const existingProduct = await productRef.get();
    if (existingProduct.exists) {
      return { success: false, error: "Product already exists" };
    }

    const sale = data.sale
      ? {
          type: data.sale.type,
          value: Number(data.sale.value),
          startDate: Timestamp.fromMillis(Date.parse(data.sale.startDate)),
          endDate: Timestamp.fromMillis(Date.parse(data.sale.endDate)),
          ...(data.sale.label && { label: data.sale.label }),
        }
      : undefined;

    uploadedUrls = await Promise.all(files.map(uploadImage));

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

    await productRef.set(doc);

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

    return { success: false, error: "Something went wrong. Please try again." };
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

export async function fetchMoreProducts(
  filters: ProductFilters,
  cursor: string,
) {
  return getProducts(
    {
      isFeatured: filters.isFeatured,
      isBestSeller: filters.isBestSeller,
      brand: filters.brand,
      categoryId: filters.categoryId,
    },
    {
      sortBy: filters.sortBy ?? "createdAt",
      sortDir: filters.sortDir ?? "desc",
    },
    PAGE_SIZE,
    cursor,
  );
}
