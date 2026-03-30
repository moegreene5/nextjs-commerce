import Logo from "@/components/ui/logo";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default async function CheckoutLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-divider flex h-16.5 items-center justify-between gap-4 border-b bg-white px-page py-4">
        <Logo />
        <Link href="/cart" aria-label="Go to cart">
          <ShoppingBag className="size-5 text-light-blue" />
        </Link>
      </header>
      {children}
    </>
  );
}
