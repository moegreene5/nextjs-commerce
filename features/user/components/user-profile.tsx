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
    <div
      role="status"
      aria-label="Loading user profile"
      aria-busy="true"
      className="flex items-center"
    >
      <Skeleton className="hidden lg:inline-block bg-gray-200 h-4 w-14 rounded" />
      <Skeleton className="size-6 rounded-full lg:hidden bg-gray-200" />
    </div>
  );
}
