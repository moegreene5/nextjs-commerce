"use client";

import { Modal, useModalStore } from "@/store/modal";
import React from "react";
import CartSheet from "./cart-modal";

export default function Modals() {
  const modals = useModalStore((s) => s.modals);

  return (
    <>
      {Object.entries(modals).map(([key, value]) => {
        return (
          <React.Fragment key={key}>
            {(value || key === "cart") && (
              <ModalFactory key={key} type={key as Modal} />
            )}
          </React.Fragment>
        );
      })}
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
