import { getProductExtras } from "../../product-queries";
import { ActiveFilterPills } from "./active-filter-pills";
import { DesktopFilters } from "./desktop-filters";
import { FilterSheet } from "./filter-sheet";
import { SortSelect } from "./sort-select";

export async function FilterBar() {
  const extras = await getProductExtras();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FilterSheet extras={extras} />
          <DesktopFilters extras={extras} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <SortSelect />
        </div>
      </div>
      <ActiveFilterPills extras={extras} />
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-border">
      <div className="flex items-center gap-2 flex-1">
        <div className="h-8 w-16 bg-neutral-100 animate-pulse rounded-sm sm:hidden" />
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-7 w-12 bg-neutral-100 animate-pulse rounded-sm" />
          <div className="h-7 w-24 bg-neutral-100 animate-pulse rounded-sm" />
          <div className="h-7 w-20 bg-neutral-100 animate-pulse rounded-sm" />
          <div className="h-7 w-24 bg-neutral-100 animate-pulse rounded-sm" />
          <div className="h-7 w-24 bg-neutral-100 animate-pulse rounded-sm" />
        </div>
      </div>
      <div className="h-8 w-36 bg-neutral-100 animate-pulse rounded-full hidden sm:block" />
      <div className="h-4 w-24 bg-neutral-100 animate-pulse rounded" />
    </div>
  );
}
