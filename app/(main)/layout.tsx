import Footer from "@/components/footer";
import Header from "@/components/header";

export default async function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
