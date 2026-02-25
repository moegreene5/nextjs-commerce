import { Skeleton } from "@/components/ui/skeleton";
import { getIsAuthenticated } from "@/features/auth/auth-queries";
import { LoginFormPage } from "@/features/auth/components/login-form";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({
  searchParams,
}: PageProps<"/account/login">) {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginPage searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginPage({ searchParams }: Props) {
  const loggedIn = await getIsAuthenticated();
  const { redirectUrl } = await searchParams;

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
