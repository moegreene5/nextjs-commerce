import { NextRequest, NextResponse } from "next/server";
import { parseApiFilters, PAGE_SIZE } from "@/features/product/search-params";
import { getProducts } from "@/features/product/product-queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = parseApiFilters(searchParams);
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
