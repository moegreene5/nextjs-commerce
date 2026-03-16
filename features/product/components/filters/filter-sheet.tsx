"use client";

import { Button } from "@/components/ui/button";
import { LinkStatus } from "@/components/ui/link-status";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductExtrasData } from "@/entities/product";
import { useFilters } from "@/hooks/use-filters";
import { cn } from "@/utils/cn";
import { ArrowLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { ChipGrid } from "./chip-grid";
import { pillActive, pillBase, pillIdle } from "./filter-pill";

type Panel = "root" | "category" | "brand" | "collections";

const PANEL_LABEL: Record<Exclude<Panel, "root">, string> = {
  category: "Category",
  brand: "Brand",
  collections: "Collections",
};

export function FilterSheet({ extras }: { extras: ProductExtrasData }) {
  const {
    params,
    isFeatured,
    isBestseller,
    clearAllHref,
    toggleFeaturedHref,
    toggleBestsellerHref,
  } = useFilters();
  const [panel, setPanel] = useState<Panel>("root");

  const activeFilterCount =
    params.category.length +
    params.brand.length +
    (isFeatured ? 1 : 0) +
    (isBestseller ? 1 : 0);

  const rootItems: {
    key: Exclude<Panel, "root">;
    label: string;
    count?: number;
  }[] = [
    ...(extras.categories.length > 0
      ? [
          {
            key: "category" as const,
            label: "Category",
            count: params.category.length,
          },
        ]
      : []),
    ...(extras.brands.length > 0
      ? [{ key: "brand" as const, label: "Brand", count: params.brand.length }]
      : []),
    {
      key: "collections" as const,
      label: "Collections",
      count: (isFeatured ? 1 : 0) + (isBestseller ? 1 : 0),
    },
  ];

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) setPanel("root");
      }}
    >
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="sm:hidden gap-2 rounded-sm"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter
          {activeFilterCount > 0 && (
            <span className="bg-foreground text-background text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-75 p-0 flex flex-col bg-white overflow-hidden border-none"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b flex-row items-center gap-3 shrink-0 space-y-0">
          {panel !== "root" && (
            <button
              type="button"
              onClick={() => setPanel("root")}
              className="p-1 -ml-1 rounded hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <SheetTitle className="text-sm font-semibold flex-1 text-left">
            {panel === "root" ? "Filters" : PANEL_LABEL[panel]}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <div
            className="flex h-full w-[200%] transition-transform duration-300 ease-in-out"
            style={{
              transform:
                panel === "root" ? "translateX(0)" : "translateX(-50%)",
            }}
          >
            <div className="w-1/2 overflow-y-auto px-5 py-2 divide-y divide-border">
              {rootItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPanel(item.key)}
                  className="w-full flex items-center justify-between py-4 text-left group"
                >
                  <span className="text-sm font-medium flex items-center gap-2">
                    {item.label}
                    {!!item.count && (
                      <span className="text-[10px] font-semibold bg-foreground text-background rounded-full w-4 h-4 flex items-center justify-center">
                        {item.count}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>

            <div className="w-1/2 overflow-y-auto px-5 py-4">
              {panel === "category" && (
                <ChipGrid
                  options={extras.categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  paramKey="category"
                />
              )}
              {panel === "brand" && (
                <ChipGrid
                  options={extras.brands.map((b) => ({
                    value: b.name,
                    label: b.name,
                  }))}
                  paramKey="brand"
                />
              )}
              {panel === "collections" && (
                <div className="flex flex-wrap gap-2">
                  <Link href={toggleFeaturedHref} scroll={false}>
                    <LinkStatus>
                      <span
                        className={cn(
                          pillBase,
                          isFeatured ? pillActive : pillIdle,
                        )}
                      >
                        Featured
                      </span>
                    </LinkStatus>
                  </Link>
                  <Link href={toggleBestsellerHref} scroll={false}>
                    <LinkStatus>
                      <span
                        className={cn(
                          pillBase,
                          isBestseller ? pillActive : pillIdle,
                        )}
                      >
                        Bestsellers
                      </span>
                    </LinkStatus>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t flex gap-2 shrink-0">
          <SheetClose asChild>
            <Link
              href={clearAllHref as Route}
              scroll={false}
              className="flex-1"
            >
              <Button variant="outline" className="w-full rounded-none h-11">
                Clear all
              </Button>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Button className="flex-1 rounded-none h-11">View results</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
