import { ComponentProps, forwardRef } from "react";
import { Pressable as BasePressable } from "react-native";

type Props = ComponentProps<typeof BasePressable> & {
  onContextMenu?: (event: PointerEvent) => void;
};

const Pressable = forwardRef((props: Props, ref: any) => {
  return <BasePressable ref={ref} {...props} />;
});

export default Pressable;
