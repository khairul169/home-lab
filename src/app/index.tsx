import React from "react";
import api from "@/lib/api";
import { useQuery } from "react-query";
import Text from "@ui/Text";
import Performance from "./_sections/Performance";
import Summary from "./_sections/Summary";
import Storage from "./_sections/Storage";
import { ScrollView } from "react-native";
import { cn } from "@/lib/utils";

const App = () => {
  const { data: system } = useQuery({
    queryKey: ["system"],
    queryFn: () => api.system.$get().then((r) => r.json()),
    refetchInterval: 1000,
  });

  return (
    <ScrollView
      contentContainerStyle={cn("px-4 py-8 md:py-16")}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-2xl font-medium">Home Lab</Text>

      <Summary data={system} />
      <Performance data={system} />
      <Storage data={system} />
    </ScrollView>
  );
};

export default App;
