import React from "react";
import api from "@/lib/api";
import { useQuery } from "react-query";
import Text from "@ui/Text";
import Performance from "./_sections/Performance";
import Summary from "./_sections/Summary";
import Storage from "./_sections/Storage";
import Container from "@ui/Container";
import { useAuth } from "@/stores/authStore";

const HomePage = () => {
  const { isLoggedIn } = useAuth();
  const { data: system } = useQuery({
    queryKey: ["system"],
    queryFn: () => api.system.$get().then((r) => r.json()),
    refetchInterval: 1000,
    enabled: isLoggedIn,
  });

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Container scrollable className="px-4 py-8 md:py-16">
      <Text className="text-2xl font-medium">Home Lab</Text>

      <Summary data={system} />
      <Performance data={system} />
      <Storage data={system} />
    </Container>
  );
};

export default HomePage;
