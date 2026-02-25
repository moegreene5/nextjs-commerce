"use client";

import { useRouter } from "next/navigation";
import { use, useTransition } from "react";
import { logOut } from "../auth-actions";
import { useAuth } from "./auth-provider";

export default function LoginButton() {
  const [isPending, startTransition] = useTransition();
  const { loggedIn: loggedInPromise } = useAuth();
  const loggedIn = use(loggedInPromise);
  const router = useRouter();

  return (
    <button
      className="text-primary hover:text-primary/75 aria-disabled:text-gray cursor-pointer text-sm font-semibold uppercase transition-colors aria-disabled:cursor-not-allowed aria-disabled:italic"
      aria-disabled={isPending}
      onClick={() => {
        if (loggedIn) {
          startTransition(async () => {
            await logOut();
            router.refresh();
          });
        } else {
          router.push("/account/login");
        }
      }}
    >
      {loggedIn ? "Sign out" : "Sign in"} {isPending && "..."}
    </button>
  );
}
