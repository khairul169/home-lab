import React from "react";
import { Slot } from "expo-router";
import { QueryClientProvider } from "react-query";
import queryClient from "@/lib/queryClient";
import { View } from "react-native";
import { cn, tw } from "@/lib/utils";
import { useDeviceContext } from "twrnc";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RootLayout = () => {
  const insets = useSafeAreaInsets();
  useDeviceContext(tw);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <View style={cn("flex-1 bg-[#f2f7fb]")}>
        <View
          style={cn("flex-1 mx-auto w-full max-w-xl", {
            paddingTop: insets.top,
          })}
        >
          <Slot />
        </View>
      </View>
    </QueryClientProvider>
  );
};

export default RootLayout;
