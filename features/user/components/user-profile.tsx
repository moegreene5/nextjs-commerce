import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Package2Icon, UserRound } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "../user-queries";

export default async function UserProfile() {
  const user = await getCurrentUser();

  return (
    <div>
      {user ? (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Avatar
              className="size-6 cursor-pointer"
              role="button"
              aria-label={`Account menu for ${
                user.user.displayName?.split(" ")[0]
              }`}
              aria-haspopup="true"
            >
              <AvatarFallback className="bg-primary text-white text-sm font-semibold capitalize">
                {user.user.displayName?.split(" ")[0][0]}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="bg-white w-full p-4 rounded-md space-y-5 shadow-2xl"
            aria-label="Account menu"
          >
            <div className="space-y-0.5" aria-live="polite">
              <p
                className="text-base md:text-lg font-semibold uppercase tracking-widest"
                id="dropdown-account-label"
              >
                Account
              </p>
              <p
                className="text-sm text-muted-foreground truncate"
                aria-label={`Signed in as ${user.user.email}`}
              >
                {user.user.email}
              </p>
            </div>
            <DropdownMenuGroup
              aria-label="Account navigation"
              className="flex gap-2.5 pb-2"
            >
              <DropdownMenuItem
                asChild
                className="rounded-none px-6 h-9 tracking-wide font-semibold uppercase cursor-pointer bg-black text-white"
              >
                <Link href="/account/orders" aria-label="View your orders">
                  <Package2Icon aria-hidden="true" fontWeight={600} />
                  Orders
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="rounded-none px-6 h-9 tracking-wide font-semibold uppercase cursor-pointer bg-black text-white"
              >
                <Link href="/account" aria-label="View your profile">
                  <UserRound aria-hidden="true" fontWeight={600} />
                  Profile
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/account" aria-label="Go to account page">
          <span className="hidden lg:inline text-xs font-semibold hover:underline">
            Account
          </span>

          <Avatar
            className="size-6 cursor-pointer lg:hidden"
            aria-hidden="true"
          >
            <AvatarFallback className="bg-muted text-muted-foreground">
              <UserRound className="size-5.5 md:size-6" aria-hidden="true" />
            </AvatarFallback>
          </Avatar>
        </Link>
      )}
    </div>
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
