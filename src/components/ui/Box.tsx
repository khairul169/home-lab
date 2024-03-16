import { cn } from "@/lib/utils";
import { ComponentPropsWithClassName } from "@/types/components";
import { forwardRef } from "react";
import { View } from "react-native";

type Props = ComponentPropsWithClassName<typeof View>;

const Box = forwardRef(({ className, style, ...props }: Props, ref: any) => {
  return (
    <View
      ref={ref}
      style={{ ...cn(className), ...((style || {}) as any) }}
      {...props}
    />
  );
});

export default Box;
