"use client";

import { cn } from "@/utils/cn";
import { LoaderCircle } from "lucide-react";
import { useLinkStatus } from "next/link";

type Props = {
  className?: string;
  width?: number;
  height?: number;
  variant?: "spinner" | "background";
  children?: React.ReactNode;
};

export function LinkStatus({
  className,
  width = 16,
  height = 16,
  variant = "spinner",
  children,
}: Props) {
  const { pending } = useLinkStatus();

  if (variant === "spinner") {
    return (
      <span className="flex items-center gap-2">
        {children}
        {pending && (
          <LoaderCircle
            aria-hidden="true"
            width={width}
            height={height}
            className={cn("animate-spin shrink-0", className)}
          />
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(pending && "text-muted-foreground bg-muted", className)}
    >
      {children}
    </span>
  );
}
