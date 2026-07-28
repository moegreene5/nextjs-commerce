import { getCart } from "@/features/cart/cart-queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const data = await getCart();

    if (!data.success) {
      return NextResponse.json(
        { error: data.error || "Failed to fetch cart" },
        { status: 400 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch cart via API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
