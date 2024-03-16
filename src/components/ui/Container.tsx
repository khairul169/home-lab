import { ScrollView, View } from "react-native";
import React from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  className?: string;
  children?: React.ReactNode;
  scrollable?: boolean;
};

const Container = ({
  className,
  children,
  scrollable = false,
}: ContainerProps) => {
  const style = cn("mx-auto w-full max-w-xl", className);

  if (scrollable) {
    return (
      <ScrollView
        contentContainerStyle={style}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={style}>{children}</View>;
};

export default Container;
