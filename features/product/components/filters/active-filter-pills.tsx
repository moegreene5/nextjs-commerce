"use client";

import { LinkStatus } from "@/components/ui/link-status";
import { ProductExtrasData } from "@/entities/product";
import { useFilters } from "@/hooks/use-filters";
import { X } from "lucide-react";
import { Route } from "next";
import Link from "next/link";

interface ActiveFilterPillsProps {
  extras: ProductExtrasData;
}

export function ActiveFilterPills({ extras }: ActiveFilterPillsProps) {
  const {
    params,
    isFeatured,
    isBestseller,
    clearAllHref,
    toggleCategoryHref,
    toggleBrandHref,
    toggleFeaturedHref,
    toggleBestsellerHref,
  } = useFilters();

  const activeFilters: { label: string; href: string }[] = [
    ...params.category.flatMap((id) => {
      const cat = extras.categories.find((c) => c.id === id);
      return cat ? [{ label: cat.name, href: toggleCategoryHref(id) }] : [];
    }),
    ...params.brand.flatMap((name) => {
      const b = extras.brands.find((b) => b.name === name);
      return b ? [{ label: b.name, href: toggleBrandHref(name) }] : [];
    }),
    ...(isFeatured ? [{ label: "Featured", href: toggleFeaturedHref }] : []),
    ...(isBestseller
      ? [{ label: "Bestsellers", href: toggleBestsellerHref }]
      : []),
  ];

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((f) => (
        <Link key={f.href} href={f.href as Route} scroll={false}>
          <LinkStatus>
            <span className="inline-flex items-center gap-1.5 text-xs border border-border rounded-full px-3 py-1 hover:border-foreground transition-colors group">
              {f.label}
              <X className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
            </span>
          </LinkStatus>
        </Link>
      ))}
      <Link
        href={clearAllHref as Route}
        scroll={false}
        className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        Reset all
      </Link>
    </div>
  );
}
