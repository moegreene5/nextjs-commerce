import "server-only";

import { Product } from "@/entities/product";
import { productSegments, Segment } from "@/lib/constants";
import { collections, store } from "@/lib/firebase/admin";
import { Filter } from "firebase-admin/firestore";
import { notFound } from "next/navigation";
import { cache } from "react";

export const getProduct = cache(async (productId: string) => {
  if (!productId || typeof productId !== "string") {
    notFound();
  }
  const productDoc = store.collection(collections.product).doc(productId);
  const product = (await productDoc.get()).data();

  if (!product) {
    notFound();
  }

  return {
    ...product,
    id: product.id,
    segment: product?.segment?.id || "",
    category: product?.category.id,
    brandCategory: product?.brandCategory.id,
    created_at: product?.created_at.toDate(),
    updated_at: product?.updated_at.toDate(),
  } as Product;
});

export const getProductsBySegment = cache(async (segment: Segment) => {
  const segmentId = productSegments[segment];

  if (!segmentId) {
    return notFound();
  }

  const segmentRef = store.doc(`${collections.segment}/${segmentId}`);

  const snapshot = await store
    .collection(collections.product)
    .where("segment", "==", segmentRef)
    .get();

  if (snapshot.empty) {
    return notFound();
  }

  return snapshot.docs.map((doc) => {
    const data = doc.data() as any;

    return {
      ...data,
      id: doc.id,
      segment: data.segment?.id,
      category: data.category?.id,
      brandCategory: data.brandCategory?.id,
      out_of_stock: data.quantityInStore === 0,
      created_at: data.created_at?.toDate?.()?.toISOString() ?? null,
      updated_at: data.updated_at?.toDate?.()?.toISOString() ?? null,
    };
  }) as Product[];
});

export const getRelatedProducts = async (productId: string) => {
  const collection = store.collection(collections.product);

  const product = await collection.doc(productId).get();

  const p = product.data();

  const query = collection
    .where(
      "category",
      "==",
      store.doc(`${collections.category}/${p?.category?.id}`),
    )
    .where(
      Filter.or(
        Filter.where("brand", "==", p?.brand),
        Filter.where(
          "segment",
          "==",
          store.doc(`${collections.segment}/${p?.segment?.id}`),
        ),
        Filter.where(
          "brandCategory",
          "==",
          store.doc(`${collections.brand_category}/${p?.brandCategory?.id}`),
        ),
      ),
    )
    .limit(8);

  const related_products = [];

  const result = await query.get();

  for (let prd of result.docs) {
    if (prd.id == productId) continue;

    related_products.push({
      ...prd.data(),
      id: prd.id,
      segment: prd.data().segment?.id,
      category: prd.data().category.id,
      brandCategory: prd.data().brandCategory.id,
      created_at: prd.data().created_at.toDate(),
      updated_at: prd.data().updated_at.toDate(),
    });
  }

  return related_products as Product[];
};
