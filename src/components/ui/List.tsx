import React from "react";
import { HStack, VStack } from "./Stack";
import { cn } from "@/lib/utils";
import Pressable from "./Pressable";
import Text from "./Text";
import Slot from "./Slot";

type Props = {
  className?: any;
  children: React.ReactNode;
};

const List = ({ className, children }: Props) => {
  return <VStack className={cn(className)}>{children}</VStack>;
};

type ListItemProps = {
  className?: any;
  children: React.ReactNode;
  icon?: React.ReactNode;
};

const ListItem = ({ className, icon, children }: ListItemProps) => {
  return (
    <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <HStack className={cn("py-2 border-b border-gray-200", className)}>
        {icon ? (
          <Slot.Text style={cn("text-gray-800 text-xl w-8")}>{icon}</Slot.Text>
        ) : null}

        <Text>{children}</Text>
      </HStack>
    </Pressable>
  );
};
List.Item = ListItem;

export default List;
