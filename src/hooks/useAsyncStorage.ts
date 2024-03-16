import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAsyncStorage = <T = any>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const getData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
      } catch (e) {
        console.warn(e);
        return defaultValue;
      }
    };

    const init = async () => setValue(await getData());
    init();
  }, [key]);

  const setValueToAsyncStorage = async (newValue: T) => {
    try {
      const jsonValue = JSON.stringify(newValue);
      await AsyncStorage.setItem(key, jsonValue);
      setValue(newValue);
    } catch (e) {
      console.warn(e);
    }
  };

  return [value, setValueToAsyncStorage] as const;
};
