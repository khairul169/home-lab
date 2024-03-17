import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export const useIsFocused = () => {
  const [isFocused, setFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  return isFocused;
};
