import { Text as BaseText } from "react-native";
import React from "react";
import { cn } from "@/lib/utils";
import { ComponentPropsWithClassName } from "@/types/components";

const Text = ({
  className,
  ...props
}: ComponentPropsWithClassName<typeof BaseText>) => {
  return <BaseText style={cn(className)} {...props} />;
};

export default Text;
