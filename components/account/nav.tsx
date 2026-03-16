"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { logOut } from "@/features/auth/auth-actions";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";

type NavLink = {
  label: string;
  href: Route;
};

interface Props {
  links: NavLink[];
  showLogout?: boolean;
}

export default function AccountNav({ links, showLogout = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentValue = useMemo(
    () => links.find((l) => l.href === pathname)?.href ?? links[0]?.href,
    [pathname, links],
  );

  const handleLogout = async () => {
    startTransition(async () => {
      await logOut();
      router.replace("/account/login");
    });
  };

  return (
    <div className="flex w-full flex-col">
      <div className="md:hidden">
        <Select
          value={currentValue}
          onValueChange={(v) => router.push(v as Route)}
        >
          <SelectTrigger
            className="backdrop-blur-sm rounded-lg h-10 min-w-40 uppercase px-2 text-sm bg-light-grey border-none outline-none focus:ring-0 focus:border-none transition-all duration-300"
            aria-label="Account navigation switch"
          >
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent className="uppercase text-xs border-gray-e1 rounded-md">
            {links?.map(({ label, href }, index) => (
              <SelectItem
                key={index}
                value={href}
                className="hover:bg-gray-100 transition-all duration-200 text-sm"
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showLogout && (
          <button
            disabled={isPending}
            onClick={handleLogout}
            className="mt-4 text-[11px] uppercase tracking-[0.18em] text-neutral-400 transition-colors duration-300 hover:text-black"
          >
            {isPending ? "Signing out" : "Sign out"}
          </button>
        )}
      </div>

      <nav className="hidden md:block">
        <ul className="flex flex-col">
          {links.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <li key={href} className="group">
                <Link
                  href={href}
                  prefetch
                  className="flex items-center justify-between py-2.5 text-xs uppercase tracking-wide transition-colors duration-300"
                >
                  <span className="relative px-0.5">
                    {label}
                    <span
                      className={`absolute -bottom-px left-0 h-px bg-black transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {showLogout && <Separator className="my-6" />}

        {showLogout && (
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="group flex items-center gap-2 text-xs uppercase"
          >
            <span className="relative">
              {isPending ? "Signing out" : "Sign out"}
              <span className="absolute -bottom-px left-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </span>
          </button>
        )}
      </nav>
    </div>
  );
}
