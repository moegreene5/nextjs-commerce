"use client";

import { Modal, useModalStore } from "@/store/modal";
import { useShallow } from "zustand/react/shallow";
import AddressDialog from "./address-dialog";
import CartSheet from "./cart-modal";

export default function Modals() {
  const activeModalKeys = useModalStore(
    useShallow((s) =>
      Object.entries(s.modals)
        .filter(([key, isOpen]) =>
          key === "cart" ? "cart" in s.modals : isOpen,
        )
        .map(([key]) => key as Modal),
    ),
  );

  return (
    <>
      {activeModalKeys.map((key) => (
        <ModalFactory key={key} type={key} />
      ))}
    </>
  );
}

function ModalFactory({ type }: { type: Modal }) {
  switch (type) {
    case "cart":
      return <CartSheet />;
    case "address":
      return <AddressDialog />;
    default:
      return null;
  }
}
