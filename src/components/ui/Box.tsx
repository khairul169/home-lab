import { cn } from "@/lib/utils";
import { ComponentPropsWithClassName } from "@/types/components";
import { View } from "react-native";

type Props = ComponentPropsWithClassName<typeof View>;

const Box = ({ className, ...props }: Props) => {
  return <View style={cn(className)} {...props} />;
};

export default Box;
