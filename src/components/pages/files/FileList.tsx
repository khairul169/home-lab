import { FlatList } from "react-native";
import React from "react";
import Text from "@ui/Text";
import { HStack } from "@ui/Stack";
import { cn } from "@/lib/utils";
import { Ionicons } from "@ui/Icons";
import Button from "@ui/Button";
import Pressable from "@ui/Pressable";
import { FileItem } from "@/types/files";
import FileMenu, { openFileMenu } from "./FileMenu";

type FileListProps = {
  files?: FileItem[];
  onSelect?: (file: FileItem) => void;
  // onMenu?: (file: FileItem) => void;
  onLongPress?: (file: FileItem) => void;
};

const FileList = ({ files, onSelect, onLongPress }: FileListProps) => {
  return (
    <>
      <FlatList
        style={cn("flex-1")}
        contentContainerStyle={cn("bg-white")}
        data={files || []}
        renderItem={({ item }) => (
          <FileItemList
            file={item}
            onPress={() => onSelect?.(item)}
            onLongPress={() => onLongPress?.(item)}
            onMenuPress={() => openFileMenu(item)}
          />
        )}
        keyExtractor={(item) => item.path}
      />

      <FileMenu />
    </>
  );
};

const FileItemList = ({
  file,
  onPress,
  onLongPress,
  onMenuPress,
}: {
  file: FileItem;
  onPress?: () => void;
  onLongPress?: () => void;
  onMenuPress?: () => void;
}) => {
  return (
    <HStack className="bg-white border-b border-gray-200 items-center">
      <Pressable
        style={({ pressed }) =>
          cn(
            "flex-1 px-4 py-3 flex flex-row gap-4 items-center",
            pressed && "bg-gray-100"
          )
        }
        onPress={onPress}
        onLongPress={onLongPress}
        onContextMenu={(e) => {
          if (onMenuPress) {
            e.preventDefault();
            onMenuPress();
          }
        }}
      >
        <Ionicons
          name={file.isDirectory ? "folder" : "document"}
          style={cn(
            "text-2xl",
            file.isDirectory ? "text-blue-400" : "text-gray-500"
          )}
        />
        <Text numberOfLines={1}>{file.name}</Text>
      </Pressable>
      <Button
        icon={<Ionicons name="ellipsis-vertical" />}
        variant="ghost"
        className="h-full px-4"
        onPress={onMenuPress}
      />
    </HStack>
  );
};

export default FileList;
