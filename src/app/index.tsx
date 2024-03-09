import { Text } from "react-native";
import React from "react";
import { cn } from "@/lib/utils";
import useAPI from "@/hooks/useAPI";
import { Ionicons } from "@ui/Icons";
import { VStack } from "@ui/Stack";
import Button from "@ui/Button";

const App = () => {
  const { data } = useAPI("/posts/1");

  return (
    <VStack className="gap-3 p-4">
      <Text style={cn("text-2xl font-medium")}>App</Text>
      <Text style={cn("w-full")}>{data?.body}</Text>

      <Button label="Click me" />
      <Button label="Click me" variant="secondary" />
      <Button label="Click me" variant="ghost" />
      <Button label="Click me" variant="outline" />
      <Button label="Click me" variant="destructive" />
      <Button icon={<Ionicons name="trash" />} size="icon" />
    </VStack>
  );
};

export default App;
