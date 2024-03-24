import "./styles.css";
import React, { useEffect, useState } from "react";
import { Stack, router, usePathname } from "expo-router";
import { QueryClientProvider } from "react-query";
import queryClient from "@/lib/queryClient";
import { View } from "react-native";
import { cn, tw } from "@/lib/utils";
import { useDeviceContext } from "twrnc";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-notifications";
import { useStore } from "zustand";
import authStore from "@/stores/authStore";
import { toastStore } from "@/stores/toastStore";
import Dialog from "@ui/Dialog";
import AudioPlayerProvider from "@/components/containers/AudioPlayerProvider";
import AudioPlayer from "@/components/pages/music/AudioPlayer";
import MiniPlayer from "@/components/pages/music/MiniPlayer";

const RootLayout = () => {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isLoggedIn = useStore(authStore, (i) => i.isLoggedIn);
  const [isLoaded, setLoaded] = useState(false);

  useDeviceContext(tw);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isLoggedIn && !pathname.startsWith("/auth")) {
      router.navigate("/auth/login");
      return;
    }
  }, [pathname, isLoggedIn, isLoaded]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <View
        style={cn("flex-1 bg-[#f2f7fb] overflow-hidden relative", {
          paddingTop: insets.top,
        })}
      >
        <Stack
          screenOptions={{ contentStyle: { backgroundColor: "#f2f7fb" } }}
        />
        <MiniPlayer />
        <AudioPlayer />
      </View>
      <Toast
        ref={(ref) => {
          toastStore.setState(ref);
        }}
      />
      <Dialog />
      <AudioPlayerProvider />
    </QueryClientProvider>
  );
};

export default RootLayout;
