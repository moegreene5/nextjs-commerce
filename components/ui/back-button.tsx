"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { startTransition } from "react";
import { Button } from "./button";

type Props = {
  href?: Parameters<typeof Link>[0]["href"];
  children?: React.ReactNode;
};

export default function BackButton({ href, children = "Back" }: Props) {
  const router = useRouter();

  const handleClick = () => {
    startTransition(() => {
      router.back();
    });
  };

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center text-sm font-medium"
      >
        <ArrowLeft aria-hidden className="mr-1 size-4" />
        {children}
      </Link>
    );
  }

  return (
    <Button onClick={handleClick}>
      <ArrowLeft aria-hidden className="mr-1 size-4" />
      {children}
    </Button>
  );
}
