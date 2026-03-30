import "server-only";

import {
  ProductCard,
  ProductDocument,
  ProductExtrasData,
} from "@/entities/product";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { collections, store } from "@/lib/firebase/admin";
import {
  normalizeProductCard,
  normalizeProductDoc,
  PRODUCT_CARD_FIELDS,
} from "@/lib/product";
import { DocumentReference, FieldPath } from "firebase-admin/firestore";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { cache } from "react";

export const getProduct = cache(async (slug: string) => {
  if (!slug || typeof slug !== "string") notFound();

  const docRef = store.collection(collections.products).doc(slug);
  const docSnap = await docRef.get();

  if (!docSnap.exists) notFound();

  return normalizeProductDoc(
    docSnap as FirebaseFirestore.QueryDocumentSnapshot,
  );
});

export const getFeaturedProducts = cache(async (limit = 5) => {
  const snapshot = await store
    .collection(collections.products)
    .where("isFeatured", "==", true)
    .select(...PRODUCT_CARD_FIELDS)
    .limit(limit)
    .get();

  if (snapshot.empty) return [];
  return snapshot.docs.map(normalizeProductCard);
});

export const getBestSellers = cache(async (limit = 5) => {
  const snapshot = await store
    .collection(collections.products)
    .where("isBestSeller", "==", true)
    .select(...PRODUCT_CARD_FIELDS)
    .limit(limit)
    .get();

  if (snapshot.empty) return [];

  return snapshot.docs.map(normalizeProductCard);
});

export const getNewArrivals = cache(async (limit = 8) => {
  const snapshot = await store
    .collection(collections.products)
    .select(...PRODUCT_CARD_FIELDS)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  if (snapshot.empty) return [];

  return snapshot.docs.map(normalizeProductCard);
});

export const getRelatedProducts = cache(async (slug: string) => {
  if (!slug) return [];

  const productRef = store.collection(collections.products).doc(slug);
  const productSnap = await productRef.get();

  if (!productSnap.exists) return [];

  const productDoc = productSnap;
  const p = productDoc.data() as ProductDocument;
  const productId = productDoc.id;
  const categoryRef = p.category;
  const currentStep = p.categoryStep;
  const stepMatch = currentStep
    ? currentStep + 1 <= 7
      ? currentStep + 1
      : null
    : null;

  const results: ProductCard[] = [];
  const seen = new Set<string>([productId]);

  const base = store
    .collection(collections.products)
    .where(FieldPath.documentId(), "!=", productId);

  const queries = [
    base.where("category", "==", categoryRef).where("brand", "==", p.brand),
    currentStep != null ? base.where("categoryStep", "==", stepMatch) : null,
    base.where("category", "==", categoryRef),
    base.where("isBestSeller", "==", true),
  ];

  for (const q of queries.filter(Boolean)) {
    const remaining = 6 - results.length;
    if (remaining <= 0) break;

    const snap = await q!.limit(remaining).get();

    for (const doc of snap.docs) {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        results.push(normalizeProductCard(doc));
      }
    }
  }

  return results;
});

export const getProductExtras = cache(async (): Promise<ProductExtrasData> => {
  "use cache";
  cacheLife("weeks");
  cacheTag(CACHE_TAGS.productExtras);

  const [categorySnap, brandsSnap] = await Promise.all([
    store.collection(collections.categories).orderBy("name", "asc").get(),
    store.collection(collections.brands).orderBy("name", "asc").get(),
  ]);

  return {
    categories: categorySnap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name ?? "",
      step: doc.data().step ?? null,
    })),
    brands: brandsSnap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name ?? "",
      slug: doc.data().slug ?? doc.id,
      logo: doc.data().logo ?? null,
    })),
  };
});

export interface GetProductsResult {
  products: ProductCard[];
  lastDocId: string | null;
  hasMore: boolean;
  filteredCount: number;
}

export const getProducts = async function (
  filters: {
    isFeatured?: boolean;
    isBestSeller?: boolean;
    brand?: string | string[];
    categoryId?: string | string[];
  },
  sort: {
    sortBy: "createdAt" | "name";
    sortDir: "asc" | "desc";
  },
  limit: number,
  startAfterDocId: string | undefined,
): Promise<GetProductsResult> {
  "use cache";

  const { isFeatured, isBestSeller, brand, categoryId } = filters;
  const { sortBy, sortDir } = sort;

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
    return {
      products: [],
      lastDocId: null,
      hasMore: false,
      filteredCount,
    };
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
};
