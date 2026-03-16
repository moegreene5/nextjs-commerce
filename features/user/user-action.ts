"use server";

import { auth, store } from "@/lib/firebase/admin";

export const deleteAllUsersAndProfiles = async () => {
  let nextPageToken: string | undefined;

  do {
    const listUsersResult = await auth.listUsers(1000, nextPageToken);

    const users = listUsersResult.users;

    if (users.length === 0) break;

    const uids = users.map((user) => user.uid);

    // 1️⃣ Delete Auth Users (bulk)
    const deleteResult = await auth.deleteUsers(uids);
    console.log(`Auth deleted: ${deleteResult.successCount}`);

    // 2️⃣ Delete Firestore Profiles (batch in chunks of 500)
    const batchSize = 500;
    for (let i = 0; i < uids.length; i += batchSize) {
      const batch = store.batch();
      const chunk = uids.slice(i, i + batchSize);

      chunk.forEach((uid) => {
        const profileRef = store.collection("profile").doc(uid);
        batch.delete(profileRef);
      });

      await batch.commit();
      console.log(`Profiles deleted: ${chunk.length}`);
    }

    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  console.log("All users and profiles deleted successfully.");
};
