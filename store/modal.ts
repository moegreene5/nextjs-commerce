import { create } from "zustand";

type ModalEntityMap = {
  cart: null;
};

export type Modal = keyof ModalEntityMap;

type ModalState = {
  modals: Partial<Record<Modal, boolean>>;
  selectedEntity: Partial<{ [k in Modal]: ModalEntityMap[k] | null }>;
};

export const useModalStore = create<ModalState>(() => ({
  modals: {},
  selectedEntity: {},
}));

export const openModal = <k extends Modal>(
  modal: k,
  entity: ModalEntityMap[k],
) =>
  useModalStore.setState((state) => ({
    modals: { ...state.modals, [modal]: true },
    selectedEntity: { ...state.selectedEntity, [modal]: entity },
  }));

export const closeModal = (modal: Modal) =>
  useModalStore.setState((state) => ({
    modals: { ...state.modals, [modal]: false },
    selectedEntity: { ...state.selectedEntity, [modal]: null },
  }));

export const closeAllModals = () =>
  useModalStore.setState(() => ({
    modals: {},
    selectedEntity: {},
  }));
