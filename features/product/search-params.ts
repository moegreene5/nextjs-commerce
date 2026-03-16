import { ProductFilters } from "@/entities/product";
import { SearchParams } from "next/dist/server/request/search-params";

export const PAGE_SIZE = 12;

export const SORT_VALUES = [
  "newest",
  "oldest",
  "name-asc",
  "name-desc",
] as const;

export type SortValue = typeof SORT_VALUES[number];

export function parseSearchParams(searchParams: SearchParams) {
  const get = (key: string) => {
    const val = searchParams[key];
    return typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";
  };

  const getAll = (key: string) => {
    const val = searchParams[key];
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  return {
    brand: getAll("brand"),
    category: getAll("category"),
    sort: (SORT_VALUES.includes(get("sort") as SortValue)
      ? get("sort")
      : "newest") as SortValue,
    featured: get("featured"),
    bestseller: get("bestseller"),
  };
}

export function buildFilters({
  brand,
  category,
  sort,
  featured,
  bestseller,
}: {
  brand: string[];
  category: string[];
  sort: SortValue;
  featured: string;
  bestseller: string;
}): ProductFilters {
  const [sortBy, sortDir] = parseSortParam(sort);
  return {
    ...(brand.length > 0 && { brand }),
    ...(category.length > 0 && { categoryId: category }),
    ...(featured === "true" && { isFeatured: true }),
    ...(bestseller === "true" && { isBestSeller: true }),
    sortBy,
    sortDir,
  };
}

function parseSortParam(
  sort: SortValue,
): [ProductFilters["sortBy"], ProductFilters["sortDir"]] {
  switch (sort) {
    case "name-asc":
      return ["name", "asc"];
    case "name-desc":
      return ["name", "desc"];
    case "oldest":
      return ["createdAt", "asc"];
    default:
      return ["createdAt", "desc"];
  }
}
