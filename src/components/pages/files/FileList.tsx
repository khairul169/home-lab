import { FlatList, Pressable } from "react-native";
import React, { useMemo } from "react";
import Text from "@ui/Text";
import { HStack } from "@ui/Stack";
import { cn } from "@/lib/utils";
import { Ionicons } from "@ui/Icons";

export type FileItem = {
  name: string;
  path: string;
  isDirectory: boolean;
};

type FileListProps = {
  files?: FileItem[];
  onSelect?: (file: FileItem) => void;
  canGoBack?: boolean;
};

const FileList = ({ files, onSelect, canGoBack }: FileListProps) => {
  const fileList = useMemo(() => {
    if (canGoBack) {
      return [{ name: "..", path: "..", isDirectory: true }, ...(files || [])];
    }
    return files || [];
  }, [files, canGoBack]);

  return (
    <FlatList
      contentContainerStyle={cn("bg-white")}
      data={fileList || []}
      renderItem={({ item }) => (
        <FileItem file={item} onPress={() => onSelect?.(item)} />
      )}
      keyExtractor={(item) => item.path}
    />
  );
};

const FileItem = ({
  file,
  onPress,
}: {
  file: FileItem;
  onPress?: () => void;
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
    </HStack>
  );
};

export default FileList;
