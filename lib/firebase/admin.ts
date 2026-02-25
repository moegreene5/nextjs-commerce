import admin, { ServiceAccount } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

export const serviceAccount: ServiceAccount = {
  projectId: process.env.PROJECT_ID,
  privateKey: process.env.PRIVATE_KEY?.replace(/\\n/gm, "\n"),
  clientEmail: process.env.CLIENT_EMAIL,
};

let adminApp;

if (!admin.apps.length) {
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
    storageBucket: process.env.STORAGE_BUCKET,
  });
}

export const app = adminApp;

export const auth = adminApp?.auth() || getAuth();

export const store = adminApp?.firestore() || getFirestore();

export const storage = adminApp?.storage() || getStorage();

export const collections = {
  profile: "profile",
  product: "product",
  cart: "cart",
  segment: "segment",
  brand_category: "brand_category",
  category: "category",
  order: "order",
  cartItems: "cartItems",
};
