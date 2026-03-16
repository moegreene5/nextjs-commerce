import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { getIsAuthenticated } from "@/features/auth/auth-queries";
import { RegisterFormPage } from "@/features/auth/components/register-form";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function Page() {
  return (
    <Container className="mx-auto max-w-2xl space-y-12 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create an Account</h1>
        <p className="mt-2">Join us and start shopping today</p>
      </div>
      <div className="min-h-40">
        <Suspense fallback={<RegisterFormSkeleton />}>
          <Register />
        </Suspense>
      </div>
    </Container>
  );
}

async function Register() {
  const user = await getIsAuthenticated();
  if (user) redirect("/");

  return <RegisterFormPage />;
}

function RegisterFormSkeleton() {
  return (
    <div className="min-w-87.5 space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-20 bg-gray-100" />
          <Skeleton className="h-10 w-full bg-gray-100" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-20 bg-gray-100" />
          <Skeleton className="h-10 w-full bg-gray-100" />
        </div>
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24 bg-gray-100" />
          <Skeleton className="h-10 w-full bg-gray-100" />
        </div>
      ))}

      <Skeleton className="h-14 w-full rounded-3xl bg-gray-100" />

      <div className="flex justify-center">
        <Skeleton className="h-4 w-40 bg-gray-100" />
      </div>
    </div>
  );
}
