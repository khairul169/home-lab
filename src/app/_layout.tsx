import React from "react";
import { Slot } from "expo-router";
import { QueryClientProvider } from "react-query";
import queryClient from "@/lib/queryClient";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RootLayout = () => {
  const insets = useSafeAreaInsets();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <View style={cn("flex-1 bg-white", { paddingTop: insets.top })}>
        <Slot />
      </View>
    </QueryClientProvider>
  );
};

export default RootLayout;
