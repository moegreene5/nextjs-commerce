"use client";

import { AddressForm } from "@/features/addresses/components/address-form";
import { closeModal, useModalStore } from "@/store/modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export default function AddressDialog() {
  const address = useModalStore((s) => s.selectedEntity.address);

  return (
    <Dialog open onOpenChange={(open) => !open && closeModal("address")}>
      <DialogContent className="flex max-h-[90vh] min-h-0 flex-col bg-white rounded-none border gap-0 border-black p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-black px-6 py-4">
          <DialogTitle className="font-geologica text-sm uppercase tracking-widest">
            {address ? "Edit address" : "Add address"}
          </DialogTitle>
        </DialogHeader>

        <AddressForm
          mode={address ? "edit" : "add"}
          initialAddress={address ?? undefined}
          onCancel={() => closeModal("address")}
          onSuccess={() => closeModal("address")}
        />
      </DialogContent>
    </Dialog>
  );
}
