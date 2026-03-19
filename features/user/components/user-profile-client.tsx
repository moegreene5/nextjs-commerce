"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package2Icon, UserRound } from "lucide-react";
import Link from "next/link";

type UserProps = {
  user: {
    displayName: string | undefined;
    email: string | undefined;
    uid: string;
  } | null;
};

export function UserProfileClient({ user }: UserProps) {
  if (!user) {
    return (
      <Link href="/account" aria-label="Go to account page">
        <span className="hidden lg:inline text-xs font-semibold hover:underline">
          Account
        </span>
        <Avatar className="size-6 cursor-pointer lg:hidden" aria-hidden="true">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <UserRound className="size-5.5 md:size-6" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
      </Link>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Avatar
          className="size-6 cursor-pointer"
          role="button"
          aria-label={`Account menu for ${user.displayName}`}
          aria-haspopup="true"
        >
          <AvatarFallback className="bg-primary text-white text-sm font-semibold capitalize">
            {user.displayName?.[0]}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white w-full p-4 rounded-md space-y-5 shadow-2xl"
      >
        <div className="space-y-0.5">
          <p className="text-base md:text-lg font-semibold uppercase tracking-widest">
            Account
          </p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuGroup className="flex gap-2.5 pb-2">
          <DropdownMenuItem
            asChild
            className="rounded-none px-6 h-9 tracking-wide font-semibold uppercase cursor-pointer bg-black text-white"
          >
            <Link href="/account/orders">
              <Package2Icon aria-hidden="true" />
              Orders
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="rounded-none px-6 h-9 tracking-wide font-semibold uppercase cursor-pointer bg-black text-white"
          >
            <Link href="/account">
              <UserRound aria-hidden="true" />
              Profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
