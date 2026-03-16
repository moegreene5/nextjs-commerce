import { Container } from "@/components/ui/container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact us",
};

export default function Page() {
  return <Container className="py-8">Welcome to Contact Page</Container>;
}
