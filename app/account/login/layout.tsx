import { Container } from "@/components/ui/container";

export default function SignInLayout({
  children,
}: LayoutProps<"/account/login">) {
  return (
    <Container className="mx-auto max-w-2xl space-y-12 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="mt-2">Sign in to your account to continue shopping</p>
      </div>
      <div className="min-h-40">{children}</div>
    </Container>
  );
}
