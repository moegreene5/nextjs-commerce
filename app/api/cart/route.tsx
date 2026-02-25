import { getCart } from "@/features/cart/cart-queries";
import { NextResponse } from "next/server";

export async function GET() {
  const response = await getCart();

  if (!response.success) {
    return NextResponse.json(
      { status: false, message: response.error },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: response, status: true });
}
