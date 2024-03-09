import React from "react";
import Box from "./Box";
import { ComponentPropsWithClassName } from "@/types/components";

type StackProps = ComponentPropsWithClassName<typeof Box> & {
  direction?: "row" | "column";
};

const Stack = ({ direction = "row", className, ...props }: StackProps) => {
  return (
    <Box
      className={[
        "flex",
        direction === "row"
          ? "flex-row items-center"
          : "flex-col items-stretch",
        className,
      ]}
      {...props}
    />
  );
};

const HStack = (props: StackProps) => <Stack direction="row" {...props} />;
const VStack = (props: StackProps) => <Stack direction="column" {...props} />;

export { HStack, VStack };
export default Stack;
