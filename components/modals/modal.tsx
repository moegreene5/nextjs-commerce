"use client";

import { Modal, useModalStore } from "@/store/modal";
import { useShallow } from "zustand/react/shallow";
import React from "react";
import dynamic from "next/dynamic";

const LazyCartSheet = dynamic(() => import("./cart-modal"), { ssr: false });

function Modals() {
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

const ModalFactory = React.memo(function ModalFactory({
  type,
}: {
  type: Modal;
}) {
  switch (type) {
    case "cart":
      return <LazyCartSheet />;

    default:
      return null;
  }
});

export default dynamic(() => Promise.resolve(Modals), {
  ssr: false,
});
