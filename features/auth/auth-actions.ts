"use server";

import { auth, store } from "@/lib/firebase/admin";
import { RegisterData, userRegisterSchema } from "@/schema/register.schema";
import { UserRecord } from "firebase-admin/auth";
import z from "zod";

export async function registerCustomer(data: RegisterData) {
  // 1. Validate input
  const parsed = userRegisterSchema.safeParse(data);
  if (!parsed.success) {
    return { error: z.treeifyError(parsed.error), status: 400 };
  }

  const {
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    username,
    businessAddress,
    businessName,
    instagramName,
  } = parsed.data;

  const profileRef = store.collection("profile");
  let firebaseUser: UserRecord | undefined;

  try {
    await store.runTransaction(async (transaction) => {
      // 2. Check if email already exists
      const existing = await transaction.get(
        profileRef.where("email", "==", email),
      );
      if (!existing.empty) {
        throw new Error("User Already Exists");
      }

      // 3. Create Firebase Auth user
      firebaseUser = await auth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
        phoneNumber,
      });

      // 4. Assign default role
      await auth.setCustomUserClaims(firebaseUser.uid, { role: "user" });

      // 5. Prepare profile data
      const profileData = {
        user_id: firebaseUser.uid,
        name: { first: firstName, last: lastName },
        email,
        phone_number: phoneNumber,
        billing_address: null,
        username: username || null,
        business_name: businessName || null,
        business_address: businessAddress || null,
        instagram_name: instagramName || null,
        created_at: new Date(),
        updated_at: new Date(),
        isSuspended: false,
        user_type: "user",
      };

      // 6. Save profile inside transaction
      const docRef = profileRef.doc(firebaseUser.uid);
      transaction.set(docRef, profileData);
    });

    return { message: "Account created successfully", status: 201 };
  } catch (err: unknown) {
    // Rollback Auth user if transaction failed
    if (firebaseUser?.uid) {
      try {
        await auth.deleteUser(firebaseUser.uid);
      } catch (_) {
        // ignore rollback failure
      }
    }

    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    return {
      error: errorMessage,
      status: errorMessage === "User Already Exists" ? 400 : 500,
    };
  }
}
