import React from "react";
import api from "@/lib/api";
import { useQuery } from "react-query";
import Text from "@ui/Text";
import Performance from "../components/pages/home/Performance";
import Summary from "../components/pages/home/Summary";
import Storage from "../components/pages/home/Storage";
import Container from "@ui/Container";
import { useAuth } from "@/stores/authStore";
import { HStack } from "@ui/Stack";
import Box from "@ui/Box";
import Apps from "../components/pages/home/Apps";
import { Stack } from "expo-router";
import { useIsFocused } from "@/hooks/useIsFocused";

const HomePage = () => {
  const { isLoggedIn } = useAuth();
  const isFocused = useIsFocused();

  const { data: system } = useQuery({
    queryKey: ["system"],
    queryFn: () => api.system.$get().then((r) => r.json()),
    refetchInterval: 1000,
    enabled: isLoggedIn && isFocused,
  });

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Container scrollable className="px-4 md:px-8 max-w-none py-8">
      <Stack.Screen options={{ headerShown: false, title: "Home Lab" }} />

      <HStack className="items-start gap-8">
        <Box className="flex-1 md:max-w-lg">
          <Text className="text-2xl font-medium">Home Lab</Text>
          <Summary data={system} />
          <Apps className="md:hidden mt-6" />
          <Performance data={system} />
          <Storage data={system} />
        </Box>

        <Apps className="hidden md:flex md:flex-col md:flex-1" />
      </HStack>
    </Container>
  );
};

export default HomePage;
