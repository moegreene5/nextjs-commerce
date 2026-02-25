import { Skeleton } from "@/components/ui/skeleton";
import LoginButton from "@/features/auth/components/login-button";
import { User } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "../user-queries";

export default async function UserProfile() {
  const user = await getCurrentUser({
    withFullUser: true,
  });

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-end gap-1">
        {user && (
          <span className="text-sm font-medium tracking-wide">
            {user?.name?.first_name} {user?.name?.last_name}
          </span>
        )}
        <LoginButton />
      </div>
      {user ? (
        <Link href="/account">
          <span className="sr-only">Go to Profile</span>
          <User
            aria-hidden
            className="size-8 cursor-pointer rounded-full p-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          />
        </Link>
      ) : (
        <User aria-hidden className="text-gray size-8 rounded-full p-1" />
      )}
    </div>
  );
}

export function UserProfileSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="bg-gray-200 h-6 w-6 rounded-full" />
      <Skeleton className="bg-gray-200 h-4 w-16 rounded" />
    </div>
  );
}
