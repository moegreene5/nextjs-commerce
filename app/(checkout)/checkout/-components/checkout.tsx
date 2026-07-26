import { Skeleton } from "@/components/ui/skeleton";
import { getAddresses } from "@/features/addresses/address-queries";
import { getCurrentUser } from "@/features/user/user-queries";
import { CheckoutFlow } from "./checkout-flow";

export async function CheckoutAddressLoader() {
  const [session, savedAddresses] = await Promise.all([
    getCurrentUser(),
    getAddresses(),
  ]);

  return (
    <CheckoutFlow
      savedAddresses={savedAddresses}
      isLoggedIn={!!session}
      userEmail={session?.user.email ?? undefined}
    />
  );
}

export function CheckoutFormSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-4 w-16 bg-gray-200" />
        <Skeleton className="mt-1 h-10 w-full bg-gray-200" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32 bg-gray-200" />
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex items-start gap-3 border border-black p-4"
          >
            <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded-full bg-gray-200" />
            <div className="w-full space-y-1.5">
              <Skeleton className="h-4 w-20 bg-gray-200" />
              <Skeleton className="h-3 w-40 bg-gray-200" />
              <Skeleton className="h-3 w-48 bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-11 w-full bg-gray-200" />
    </div>
  );
}
