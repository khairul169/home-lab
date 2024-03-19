import { Platform } from "react-native";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { AttachAddon } from "xterm-addon-attach";

import Box from "@ui/Box";
import Text from "@ui/Text";
import React, { useEffect, useRef } from "react";
import "xterm/css/xterm.css";
import { BASEURL, WS_BASEURL } from "@/lib/constants";
import { useAuth } from "@/stores/authStore";
import { Stack } from "expo-router";
import BackButton from "@ui/BackButton";
import Head from "@/components/utility/Head";

const isWeb = Platform.OS === "web";

const TerminalPage = () => {
  const { token } = useAuth();
  const terminalRef = useRef<any>();
  const fitRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!isWeb || !token) {
      return;
    }

    const term = new Terminal({ theme: { background: "#1d1e2b" } });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    const socket = new WebSocket(WS_BASEURL + "/terminal?token=" + token);
    const attachAddon = new AttachAddon(socket);

    // Attach the socket to term
    term.loadAddon(attachAddon);
    term.open(terminalRef.current);

    fitAddon.fit();
    fitRef.current = fitAddon;

    const sendResizeSignal = (data: { cols: number; rows: number }) => {
      socket.send("resize:" + [data.cols, data.rows].join(","));
    };

    term.onResize(sendResizeSignal);
    setTimeout(() => {
      sendResizeSignal({ cols: term.cols, rows: term.rows });
    }, 1000);

    return () => {
      attachAddon.dispose();
      fitAddon.dispose();
      term.dispose();
      fitRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    if (!isWeb) {
      return;
    }

    const onResize = () => {
      if (fitRef.current) {
        fitRef.current.fit();
      }
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (!isWeb) {
    return (
      <Box className="p-8">
        <Text className="text-center">Only web platform suppported.</Text>
      </Box>
    );
  }

  return (
    <>
      <Head title="Terminal" />
      <Stack.Screen
        options={{ title: "Terminal", headerLeft: () => <BackButton /> }}
      />
      <div
        ref={terminalRef}
        style={{ height: "100vh", background: "#1d1e2b", padding: 16 }}
      />
    </>
  );
};

export default TerminalPage;
