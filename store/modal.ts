import { create } from "zustand";

type ModalEntityMap = {
  cart: null;
};

export type Modal = keyof ModalEntityMap;

type ModalStore = {
  modals: Partial<Record<Modal, boolean>>;
  selectedEntity: Partial<{ [k in Modal]: ModalEntityMap[k] | null }>;
  openModal: <k extends Modal>(modal: k, entity: ModalEntityMap[k]) => void;
  closeModal: (modal: Modal) => void;
  closeAllModals: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  modals: {},
  selectedEntity: {},
  openModal: (modal, entity) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: true },
      selectedEntity: { ...state.selectedEntity, [modal]: entity },
    })),
  closeModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: false },
      selectedEntity: { ...state.selectedEntity, [modal]: null },
    })),
  closeAllModals: () =>
    set(() => ({
      modals: {},
      selectedEntity: {},
    })),
}));
