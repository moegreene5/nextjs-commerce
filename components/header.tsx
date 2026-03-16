import CartBadge from "@/features/cart/components/cart-badge";
import UserProfile, {
  UserProfileSkeleton,
} from "@/features/user/components/user-profile";
import { ShoppingCart } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";
import Logo from "./ui/logo";

const ProductAddedAlert = dynamic(() =>
  import("@/features/product/components/cart-alert").then(
    (mod) => mod.CartAlert,
  ),
);

export default function Header() {
  return (
    <header className="border-divider flex h-16.5 items-center justify-between gap-4 border-b bg-white px-page py-4 sticky top-0 z-50">
      <div className="flex gap-6 items-center">
        <Logo />
        <Link
          className="text-sm tracking-wide font-semibold hover:opacity-90 transition-all ease-in-out"
          href="/collections/shop-all"
        >
          Shop All
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Suspense fallback={<UserProfileSkeleton />}>
          {<UserProfile />}
        </Suspense>
        <Suspense fallback={<ShoppingCart className="size-5" />}>
          <CartBadge />
        </Suspense>

        <div className="relative">
          <ProductAddedAlert />
        </div>
      </div>
    </header>
  );
}
