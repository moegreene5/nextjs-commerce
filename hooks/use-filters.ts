import { SortValue } from "@/features/product/search-params";
import { Route } from "next";
import { useSearchParams } from "next/navigation";

export function useFilters() {
  const searchParams = useSearchParams();
  const params = {
    brand: searchParams.getAll("brand"),
    category: searchParams.getAll("category"),
    sort: (searchParams.get("sort") ?? "newest") as SortValue,
    featured: searchParams.get("featured") ?? "",
    bestseller: searchParams.get("bestseller") ?? "",
  };

  function buildHref(
    updates: Partial<Record<string, string | string[]>>,
  ): Route {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      p.delete(k);
      if (Array.isArray(v)) v.forEach((val) => p.append(k, val));
      else if (v) p.set(k, v);
    }
    return `?${p.toString()}`;
  }

  function toggleArrayParam(key: string, value: string) {
    const current = searchParams.getAll(key);
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    return buildHref({ [key]: updated });
  }

  const isFeatured = params.featured === "true";
  const isBestseller = params.bestseller === "true";

  return {
    params,
    isFeatured,
    isBestseller,
    clearAllHref: "?",
    toggleCategoryHref: (id: string) => toggleArrayParam("category", id),
    toggleBrandHref: (name: string) => toggleArrayParam("brand", name),
    toggleFeaturedHref: buildHref({ featured: isFeatured ? "" : "true" }),
    toggleBestsellerHref: buildHref({ bestseller: isBestseller ? "" : "true" }),
    sortHref: (value: string) => buildHref({ sort: value }),
  };
}
