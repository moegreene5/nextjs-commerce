import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "../user-queries";
import { UserProfileClient } from "./user-profile-client";

export default async function UserProfile() {
  const user = await getCurrentUser();

  return (
    <UserProfileClient
      user={
        user
          ? {
              displayName: user.user.displayName,
              email: user.user.email,
              uid: user.user.uid,
            }
          : null
      }
    />
  );
}

export function UserProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading user profile" aria-busy="true">
      <Skeleton className="hidden lg:block bg-gray-200 h-4 w-14 rounded" />
      <Skeleton className="bg-gray-200 h-6 w-6 rounded-full lg:hidden" />
    </div>
  );
}
