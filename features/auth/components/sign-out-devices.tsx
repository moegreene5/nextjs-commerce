"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { revokeAllSessions } from "../auth-actions";

export function SignOutAllDevices() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await revokeAllSessions();
      if (result && result.message) {
        toast.error(result.message);
        return;
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="h-11 border border-black px-6 text-[11px] uppercase tracking-[0.18em] text-black transition-colors duration-200 hover:bg-black hover:text-white disabled:border-neutral-200 disabled:text-neutral-300"
    >
      {isPending ? "Signing out..." : "Sign out all devices"}
    </button>
  );
}
