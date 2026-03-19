import { Container } from "@/components/ui/container";
import AccountInformation from "@/features/user/components/user-account-information";
import { getCurrentUser } from "@/features/user/user-queries";
import { Suspense } from "react";

export default function Account() {
  return (
    <main>
      <Container className="py-12">
        <h2 className="uppercase text-sm lg:text-base mb-6 md:mb-8">
          Your Personal Dashboard
        </h2>
        <Suspense fallback={<AccountSkeleton />}>
          <AccountPage />
        </Suspense>
      </Container>
    </main>
  );
}

async function AccountPage() {
  const user = await getCurrentUser({
    withFullUser: true,
    redirectIfNotFound: true,
  });

  return <AccountInformation user={user} />;
}

function AccountSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-black/10" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-black/10 rounded" />
          <div className="h-6 w-48 bg-black/10 rounded" />
          <div className="h-3 w-16 bg-black/10 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 bg-black/5 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
