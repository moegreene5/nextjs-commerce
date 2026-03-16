import { Container } from "@/components/ui/container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About us",
};

export default function Page() {
  return <Container className="py-8">Welcome to about page</Container>;
}
