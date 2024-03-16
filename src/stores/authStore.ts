import { createStore, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState = {
  token: "",
  isLoggedIn: false,
};

const authStore = createStore(
  persist(() => initialState, {
    name: "auth",
    storage: createJSONStorage(() => AsyncStorage),
  })
);

export const setAuthToken = (token: string) => {
  authStore.setState({ token, isLoggedIn: true });
};

export const logout = () => {
  authStore.setState(initialState);
};

export const useAuth = () => useStore(authStore);

export default authStore;
