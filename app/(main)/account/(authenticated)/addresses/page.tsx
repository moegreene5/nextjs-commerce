import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAddresses } from "@/features/addresses/address-queries";
import { AddressCard } from "@/features/addresses/components/address-card";
import { Suspense } from "react";

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<AddressListSkeleton />}>
        <AddressList />
      </Suspense>
    </div>
  );
}

async function AddressList() {
  const addresses = await getAddresses();

  if (addresses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 p-10 text-center">
        <p className="text-sm text-stone-400">
          You haven't saved any addresses yet.
        </p>
        <Button className="mt-4">Add Address</Button>
      </div>
    );
  }

  return (
    <>
      {addresses.map((a) => (
        <AddressCard key={a.id} address={a} />
      ))}
      <Button>Add Address</Button>
    </>
  );
}

function AddressListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading addresses">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-100 bg-white p-6 shadow-sm"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-gray-300">
              <Skeleton className="h-4 w-16" />
              {i === 0 && (
                <Skeleton className="h-4 w-14 rounded-full bg-gray-200" />
              )}
            </div>
            <Skeleton className="h-3 w-40 bg-gray-200" />
            <Skeleton className="h-3 w-56 bg-gray-200" />
            <Skeleton className="h-3 w-32 bg-gray-200" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-16 rounded-lg bg-gray-200" />
            <Skeleton className="h-9 w-20 rounded-lg bg-gray-200" />
          </div>
        </div>
      ))}
      <Skeleton className="mt-2 h-10 w-40 rounded-lg bg-gray-200" />
    </div>
  );
}
