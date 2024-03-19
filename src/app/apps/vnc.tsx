import { WS_BASEURL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/stores/authStore";
import BackButton from "@ui/BackButton";
import Box from "@ui/Box";
import Button from "@ui/Button";
import { Ionicons } from "@ui/Icons";
import { Stack } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { VncScreen, VncScreenHandle } from "react-vnc";
import { openFullscreen } from "./lib";
import Head from "@/components/utility/Head";

const VncPage = () => {
  const containerRef = useRef<HTMLDivElement>(null!);
  const vncRef = useRef<VncScreenHandle>(null!);
  const { token } = useAuth();

  const onFullscreen = () => {
    openFullscreen(containerRef.current);
  };

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <>
      <Head title="VNC" />
      <Stack.Screen
        options={{
          title: "VNC",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <Button
              icon={<Ionicons name="expand-outline" />}
              variant="ghost"
              className="h-14 w-14"
              iconClassName="text-black text-2xl"
              onPress={onFullscreen}
            />
          ),
        }}
      />

      {token ? (
        <div ref={containerRef} style={cn("w-full h-full")}>
          <VncScreen
            url={WS_BASEURL + "/vnc?token=" + token}
            resizeSession
            scaleViewport
            background="#000000"
            style={cn("w-full h-full")}
            ref={vncRef}
          />
        </div>
      ) : null}
    </>
  );
};

export default VncPage;
