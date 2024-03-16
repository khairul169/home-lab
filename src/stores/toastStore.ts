import { createStore } from "zustand";
import { Toast, ToastOptions } from "react-native-toast-notifications";

export const toastStore = createStore<typeof Toast | null>(() => null);

export const showToast = (
  message: string | JSX.Element,
  toastOptions?: ToastOptions
) => {
  const toast = toastStore.getState();
  if (toast) {
    toast.show(message, toastOptions);
  }
};
