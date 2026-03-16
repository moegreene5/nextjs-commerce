import admin, { ServiceAccount } from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

export const serviceAccount: ServiceAccount = {
  projectId: process.env.PROJECT_ID,
  privateKey: process.env.PRIVATE_KEY?.replace(/\\n/gm, "\n"),
  clientEmail: process.env.CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
    storageBucket: process.env.STORAGE_BUCKET,
  });
}

export const app = admin.app();

export const auth = getAuth(app);

export const store = getFirestore(app);

export const storage = getStorage(app);

export const collections = {
  profile: "profile",
  products: "products",
  cart: "cart",
  segment: "segment",
  brands: "brands",
  categories: "categories",
  order: "order",
  cartItems: "cartItems",
};
