"use client";

import { LinkStatus } from "@/components/ui/link-status";
import { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface ChipGridProps {
  options: { value: string; label: string }[];
  paramKey: "category" | "brand";
}

export function ChipGrid({ options, paramKey }: ChipGridProps) {
  const searchParams = useSearchParams();
  const selected = searchParams.getAll(paramKey);

  function buildHref(value: string): Route {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(paramKey);

    if (current.includes(value)) {
      const updated = current.filter((v) => v !== value);
      params.delete(paramKey);
      updated.forEach((v) => params.append(paramKey, v));
    } else {
      params.append(paramKey, value);
    }

    return `?${params.toString()}`;
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {options.map((o) => (
        <Link
          key={o.value}
          href={buildHref(o.value)}
          scroll={false}
          className="flex items-center justify-between py-3.5 group"
        >
          <LinkStatus>
            <span className="text-sm">{o.label}</span>
          </LinkStatus>
          <input
            type="checkbox"
            readOnly
            checked={selected.includes(o.value)}
            className="w-4 h-4 rounded border-border accent-black pointer-events-none"
          />
        </Link>
      ))}
    </div>
  );
}
