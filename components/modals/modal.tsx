"use client";

import { Modal, useModalStore } from "@/store/modal";
import CartSheet from "./cart-modal";
import { useShallow } from "zustand/react/shallow";

export default function Modals() {
  const activeModalKeys = useModalStore(
    useShallow((s) =>
      Object.entries(s.modals)
        .filter(([_, isOpen]) => isOpen)
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

    default:
      return null;
  }
}
