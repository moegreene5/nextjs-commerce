"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkStatus } from "@/components/ui/link-status";
import { ProductExtrasData } from "@/entities/product";
import { useFilters } from "@/hooks/use-filters";
import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilterPill, pillActive, pillBase, pillIdle } from "./filter-pill";

export function DesktopFilters({ extras }: { extras: ProductExtrasData }) {
  const {
    params,
    isFeatured,
    isBestseller,
    toggleCategoryHref,
    toggleBrandHref,
    toggleFeaturedHref,
    toggleBestsellerHref,
  } = useFilters();
  const router = useRouter();

  return (
    <div className="hidden sm:flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium mr-0.5">Filter:</span>

      {extras.categories.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <FilterPill
              active={params.category.length > 0}
              count={params.category.length}
            >
              Category <ChevronDown className="w-3 h-3 opacity-60" />
            </FilterPill>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-white min-w-44">
            {extras.categories.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.id}
                checked={params.category.includes(c.id)}
                onCheckedChange={() =>
                  router.push(toggleCategoryHref(c.id), { scroll: false })
                }
              >
                {c.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {extras.brands.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <FilterPill
              active={params.brand.length > 0}
              count={params.brand.length}
            >
              Brand <ChevronDown className="w-3 h-3 opacity-60" />
            </FilterPill>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-white min-w-44">
            {extras.brands.map((b) => (
              <DropdownMenuCheckboxItem
                key={b.id}
                checked={params.brand.includes(b.name)}
                onCheckedChange={() =>
                  router.push(toggleBrandHref(b.name), { scroll: false })
                }
              >
                {b.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Link href={toggleFeaturedHref} scroll={false}>
        <LinkStatus>
          <span className={cn(pillBase, isFeatured ? pillActive : pillIdle)}>
            Featured
          </span>
        </LinkStatus>
      </Link>

      <Link href={toggleBestsellerHref} scroll={false}>
        <LinkStatus>
          <span className={cn(pillBase, isBestseller ? pillActive : pillIdle)}>
            Bestsellers
          </span>
        </LinkStatus>
      </Link>
    </div>
  );
}
