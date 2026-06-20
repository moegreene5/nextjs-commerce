"use server";

import {
  ProductCard,
  ProductDocument,
  ProductFilters,
} from "@/entities/product";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { collections, store } from "@/lib/firebase/admin";
import { normalizeProductCard, PRODUCT_CARD_FIELDS } from "@/lib/product";
import { getUserFromSession } from "@/lib/session";
import {
  createProductActionSchema,
  imagesSchema,
} from "@/schema/product.schema";
import { deleteImage, uploadImage } from "@/utils/cloudinary";
import { randomBytes } from "crypto";
import { DocumentReference, Timestamp } from "firebase-admin/firestore";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { cookies } from "next/headers";
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

export interface GetProductsResult {
  products: ProductCard[];
  lastDocId: string | null;
  hasMore: boolean;
  filteredCount: number;
}

function isDefaultView(filters: ProductFilters): boolean {
  return (
    filters.isFeatured === undefined &&
    filters.isBestSeller === undefined &&
    filters.brand === undefined &&
    filters.categoryId === undefined &&
    filters.startAfterDocId === undefined &&
    filters.sortBy === "createdAt" &&
    filters.sortDir === "desc"
  );
}

export async function getProducts(
  filters: ProductFilters,
): Promise<GetProductsResult> {
  if (isDefaultView(filters)) {
    return getDefaultProducts(filters.limit ?? PAGE_SIZE);
  }

  return getProductsUncached(filters);
}

async function getDefaultProducts(limit: number): Promise<GetProductsResult> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.allProducts);

  return getProductsUncached({
    sortBy: "createdAt",
    sortDir: "desc",
    limit,
  });
}

async function getProductsUncached(
  filters: ProductFilters,
): Promise<GetProductsResult> {
  const {
    isFeatured,
    isBestSeller,
    brand,
    categoryId,
    sortBy = "createdAt",
    sortDir = "desc",
    limit = PAGE_SIZE,
    startAfterDocId,
  } = filters;

  let baseQuery: FirebaseFirestore.Query = store
    .collection(collections.products)
    .select(...PRODUCT_CARD_FIELDS);

  if (isFeatured !== undefined) {
    baseQuery = baseQuery.where("isFeatured", "==", isFeatured);
  }
  if (isBestSeller !== undefined) {
    baseQuery = baseQuery.where("isBestSeller", "==", isBestSeller);
  }
  if (brand !== undefined) {
    const brands = Array.isArray(brand) ? brand : [brand];
    baseQuery =
      brands.length === 1
        ? baseQuery.where("brand", "==", brands[0])
        : baseQuery.where("brand", "in", brands);
  }

  if (categoryId !== undefined) {
    const ids = Array.isArray(categoryId) ? categoryId : [categoryId];
    if (ids.length === 1) {
      const ref: DocumentReference = store.doc(
        `${collections.categories}/${ids[0]}`,
      );
      baseQuery = baseQuery.where("category", "==", ref);
    } else {
      const refs = ids.map((id) =>
        store.doc(`${collections.categories}/${id}`),
      );
      baseQuery = baseQuery.where("category", "in", refs);
    }
  }

  const [filteredCountSnap, paginatedSnap] = await Promise.all([
    baseQuery.count().get(),
    (async () => {
      let q = baseQuery.orderBy(sortBy, sortDir);
      if (startAfterDocId) {
        const cursorSnap = await store
          .collection(collections.products)
          .doc(startAfterDocId)
          .get();
        if (cursorSnap.exists) q = q.startAfter(cursorSnap);
      }
      return q.limit(limit + 1).get();
    })(),
  ]);

  const filteredCount = filteredCountSnap.data().count;

  if (paginatedSnap.empty) {
    return { products: [], lastDocId: null, hasMore: false, filteredCount };
  }

  const hasMore = paginatedSnap.docs.length > limit;
  const docs = hasMore
    ? paginatedSnap.docs.slice(0, limit)
    : paginatedSnap.docs;

  return {
    products: docs.map(normalizeProductCard),
    lastDocId: hasMore ? docs[docs.length - 1].id : null,
    hasMore,
    filteredCount,
  };
}
