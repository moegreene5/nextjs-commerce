import { Container } from "@/components/ui/container";
import { ForgotPasswordFormPage } from "@/features/auth/components/reset-password-form";

export default function Page() {
  return (
    <Container className="py-12 max-w-2xl">
      <ForgotPasswordFormPage />
    </Container>
  );
}
