import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { getIsAuthenticated } from "@/features/auth/auth-queries";
import { LoginFormPage } from "@/features/auth/components/login-form";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login",
};

export default async function Page() {
  return (
    <>
      <Container className="mx-auto max-w-2xl space-y-12 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2">Sign in to your account to continue shopping</p>
        </div>
        <div className="min-h-40">
          <Suspense fallback={<LoginSkeleton />}>
            <LoginPage />
          </Suspense>
        </div>
      </Container>
    </>
  );
}

async function LoginPage() {
  const loggedIn = await getIsAuthenticated();

  if (loggedIn) redirect("/");

  return <LoginFormPage />;
}

function LoginSkeleton() {
  return (
    <div className="min-w-87.5 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-accent/50" />
        <Skeleton className="h-10 w-full rounded-md bg-accent/50" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-28 bg-accent/50" />
        <Skeleton className="h-10 w-full rounded-md bg-accent/50" />
      </div>

      <Skeleton className="h-10 w-full rounded-md bg-accent/50" />

      <div className="flex justify-center">
        <Skeleton className="h-4 w-48 bg-accent/50" />
      </div>
    </div>
  );
}
