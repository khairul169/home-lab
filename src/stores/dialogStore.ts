import { createStore } from "zustand";

type DialogStore = {
  isVisible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  open: (title: string, message: string, onConfirm: () => void) => void;
  close: () => void;
};

export const dialogStore = createStore<DialogStore>((set) => ({
  isVisible: false,
  title: "",
  message: "",
  onConfirm: () => {},
  open(title, message, onConfirm) {
    set({ title, message, onConfirm });
  },
  close() {
    set({ isVisible: false });
  },
}));

export const showDialog = (
  title: string,
  message: string,
  onConfirm: () => void
) => {
  dialogStore.setState({ title, message, onConfirm, isVisible: true });
};
