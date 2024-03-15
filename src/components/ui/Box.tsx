import { cn } from "@/lib/utils";
import { ComponentPropsWithClassName } from "@/types/components";
import { View } from "react-native";

type Props = ComponentPropsWithClassName<typeof View>;

const Box = ({ className, style, ...props }: Props) => {
  return (
    <View style={{ ...cn(className), ...((style || {}) as any) }} {...props} />
  );
};

export default Box;
