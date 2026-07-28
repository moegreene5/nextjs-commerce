import { Metadata } from "next";
import { default as CartData } from "./components/cart-data";

export const metadata: Metadata = { title: "Your Shopping Cart" };

export default function Page() {
  return (
    <div className="min-h-[calc(100svh-80px)] pb-16">
      <CartData />
    </div>
  );
}
