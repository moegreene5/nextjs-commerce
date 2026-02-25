import CartBadge from "@/features/cart/components/cart-badge";
import UserProfile, {
  UserProfileSkeleton,
} from "@/features/user/components/user-profile";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function Header() {
  return (
    <header className="border-divider flex min-h-20 items-center justify-between gap-4 border-b bg-white px-page py-4">
      <h1 className="text-2xl italic font-bold">
        <Link href="/">Your logo</Link>
      </h1>
      <div className="flex items-center gap-4">
        <Suspense fallback={<UserProfileSkeleton />}>
          {<UserProfile />}
        </Suspense>
        <Suspense fallback={<ShoppingCart className="size-5" />}>
          <CartBadge />
        </Suspense>
      </div>
    </header>
  );
}
