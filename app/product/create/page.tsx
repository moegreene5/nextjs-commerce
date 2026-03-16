import { Container } from "@/components/ui/container";
import CreateProductForm from "@/features/product/components/create-product";
import { getProductExtras } from "@/features/product/product-queries";
import { Suspense } from "react";

export default function Page() {
  return (
    <Container className="py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <CreateProduct />
      </Suspense>
    </Container>
  );
}

async function CreateProduct() {
  const extras = await getProductExtras();

  return (
    <div>
      <CreateProductForm extras={extras} />
    </div>
  );
}
