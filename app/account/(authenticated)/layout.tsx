import AccountNav from "@/components/account/nav";
import { Container } from "@/components/ui/container";
import type { Metadata, Route } from "next";

export const metadata: Metadata = {
  title: "My Account",
};

const ACCOUNT_LINKS: { label: string; href: Route }[] = [
  { label: "Your personal dashboard", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Security", href: "/account/security" },
];

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <Container className="py-12 md:py-16 w-full">
      <div className="flex flex-col gap-10 md:flex-row md:items-start">
        <div className="w-full shrink-0 md:sticky md:top-32 md:h-fit md:w-44 lg:w-52">
          <AccountNav links={ACCOUNT_LINKS} showLogout />
        </div>
        <div className="min-w-0 flex-1 md:pr-16 lg:pr-24">{children}</div>
      </div>
    </Container>
  );
}
