import { View, Text } from "react-native";
import React from "react";
import { cn } from "@/lib/utils";

const Divider = ({ className }: { className?: string }) => {
  return <View style={cn("border-b border-gray-300 w-full h-1", className)} />;
};

export default Divider;
