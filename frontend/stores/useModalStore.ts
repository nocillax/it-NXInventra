import { create } from "zustand";
import { CustomField, Item } from "@/types/shared";

export type ModalType =
  | "createInventory"
  | "createItem"
  | "editItem"
  | "deleteItem"
  | "deleteCustomField";

interface ModalData {
  inventoryId?: string;
  item?: Item;
  items?: Item[];
  field?: CustomField;
  onSuccess?: () => void;
}

interface ModalState {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false, type: null, data: {} }),
}));
