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
import { FieldPath } from "firebase-admin/firestore";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";

export const getProduct = async (slug: string) => {
  if (!slug || typeof slug !== "string") notFound();

  const docRef = store.collection(collections.products).doc(slug);
  const docSnap = await docRef.get();

  if (!docSnap.exists) notFound();

  return normalizeProductDoc(
    docSnap as FirebaseFirestore.QueryDocumentSnapshot,
  );
};

export const getFeaturedProducts = async (limit = 5) => {
  const snapshot = await store
    .collection(collections.products)
    .where("isFeatured", "==", true)
    .select(...PRODUCT_CARD_FIELDS)
    .limit(limit)
    .get();

  if (snapshot.empty) return [];
  return snapshot.docs.map(normalizeProductCard);
};

export const getBestSellers = async (limit = 5) => {
  const snapshot = await store
    .collection(collections.products)
    .where("isBestSeller", "==", true)
    .select(...PRODUCT_CARD_FIELDS)
    .limit(limit)
    .get();

  if (snapshot.empty) return [];

  return snapshot.docs.map(normalizeProductCard);
};

export const getNewArrivals = async (limit = 8) => {
  const snapshot = await store
    .collection(collections.products)
    .select(...PRODUCT_CARD_FIELDS)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  if (snapshot.empty) return [];

  return snapshot.docs.map(normalizeProductCard);
};

export const getRelatedProducts = async (slug: string) => {
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
};

export const getProductExtras = async (): Promise<ProductExtrasData> => {
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
};
