"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkStatus } from "@/components/ui/link-status";
import { useFilters } from "@/hooks/use-filters";
import { cn } from "@/utils/cn";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarArrowDown,
  CalendarArrowUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest", icon: CalendarArrowDown },
  { value: "oldest", label: "Oldest", icon: CalendarArrowUp },
  { value: "name-asc", label: "Name A–Z", icon: ArrowDownAZ },
  { value: "name-desc", label: "Name Z–A", icon: ArrowUpAZ },
] as const;

export function SortSelect() {
  const { params, sortHref } = useFilters();
  const [open, setOpen] = useState(false);
  const current =
    SORT_OPTIONS.find((o) => o.value === params.sort) ?? SORT_OPTIONS[0];

  useEffect(() => {
    setOpen(false);
  }, [params.sort]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="h-12 w-44 px-4 rounded-full border border-border bg-white font-medium text-sm flex items-center justify-between gap-2 hover:bg-neutral-50 transition-colors focus-visible:outline-none">
        <span className="flex items-center gap-2">
          <current.icon className="w-3.5 h-3.5 text-muted-foreground" />
          {current.label}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-white border border-border rounded-xl shadow-md p-1 min-w-44"
      >
        {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            asChild
            onSelect={(e) => e.preventDefault()}
          >
            <Link
              href={sortHref(value)}
              scroll={false}
              className={cn(
                "flex items-center justify-between rounded-lg text-sm font-medium cursor-pointer py-2.5 px-3",
                params.sort === value && "bg-foreground text-background",
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </span>
              <LinkStatus />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
