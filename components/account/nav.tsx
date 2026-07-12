"use client";

import { Separator } from "@/components/ui/separator";
import { logOut } from "@/features/auth/auth-actions";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

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

  const handleLogout = () => {
    startTransition(async () => {
      await logOut();
      router.replace("/account/login");
    });
  };

  return (
    <div className="flex w-full flex-col">
      <nav className="md:hidden" aria-label="Account navigation">
        <ul className="-mx-4 flex gap-6 overflow-x-auto border-b border-black px-4 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {links.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center whitespace-nowrap py-3 text-xs uppercase tracking-wider transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                    isActive ? "text-black" : "text-neutral-500"
                  }`}
                >
                  {label}
                  <span
                    className={`absolute -bottom-px left-0 h-0.5 bg-black transition-all duration-300 ${
                      isActive ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {showLogout && (
          <button
            disabled={isPending}
            onClick={handleLogout}
            className="mt-4 text-[11px] uppercase tracking-[0.18em] text-neutral-600 transition-colors duration-300 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50"
          >
            {isPending ? "Signing out" : "Sign out"}
          </button>
        )}
      </nav>

      <nav className="hidden md:block">
        <ul className="flex flex-col">
          {links.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <li key={href} className="group">
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center justify-between rounded-sm py-2.5 text-xs uppercase tracking-wider transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                    isActive
                      ? "text-black"
                      : "text-neutral-600 hover:text-black"
                  }`}
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
            className="group flex items-center gap-2 text-xs uppercase text-neutral-600 transition-colors duration-300 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50"
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
