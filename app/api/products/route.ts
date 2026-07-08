import { NextRequest, NextResponse } from "next/server";
import {
  buildFilters,
  parseSearchParams,
  PAGE_SIZE,
  SortValue,
} from "@/features/product/search-params";
import { getProducts } from "@/features/product/product-queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rawParams: Record<string, string | string[]> = {};

    searchParams.forEach((_, key) => {
      const values = searchParams.getAll(key);
      rawParams[key] = values.length > 1 ? values : values[0];
    });

    const parsed = parseSearchParams(rawParams);

    const filters = buildFilters(parsed);

    const startAfterDocId = searchParams.get("startAfterDocId") || undefined;

    const data = await getProducts({
      ...filters,
      limit: PAGE_SIZE,
      startAfterDocId,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch products via API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
