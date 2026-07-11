"use client";

import { Button } from "@/components/ui/button";
import { openModal } from "@/store/modal";
import { Plus } from "lucide-react";

export default function AddAddressButton({
  className,
}: {
  className?: string;
}) {
  return (
    <Button
      className={className}
      size={"lg"}
      onClick={() => openModal("address", null)}
    >
      <Plus /> Add Address
    </Button>
  );
}
