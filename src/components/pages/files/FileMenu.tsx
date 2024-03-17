import React from "react";
import { createStore, useStore } from "zustand";
import { FileItem } from "@/types/files";
import Text from "@ui/Text";
import List from "@ui/List";
import { Ionicons } from "@ui/Icons";
import { cn } from "@/lib/utils";
import ActionSheet from "@ui/ActionSheet";
import { HStack } from "@ui/Stack";
import Button from "@ui/Button";
import { openFile } from "@/app/apps/files/utils";

type Store = {
  isVisible: boolean;
  file?: FileItem | null;
};

const store = createStore<Store>(() => ({
  isVisible: false,
  file: null,
}));

export const openFileMenu = (file: FileItem) => {
  store.setState({ isVisible: true, file });
};

const FileMenu = () => {
  const { isVisible, file } = useStore(store);
  const onClose = () => store.setState({ isVisible: false });

  const onDownload = () => {
    openFile(file, true);
    onClose();
  };

  return (
    <ActionSheet isVisible={isVisible} onClose={onClose}>
      <Text className="text-lg md:text-xl" numberOfLines={1}>
        {file?.name}
      </Text>

      <List className="mt-4">
        <List.Item icon={<Ionicons name="pencil" />}>Rename</List.Item>
        <List.Item icon={<Ionicons name="copy" />}>Copy</List.Item>
        <List.Item icon={<Ionicons name="cut-outline" />}>Move</List.Item>
        <List.Item icon={<Ionicons name="download" />} onPress={onDownload}>
          Download
        </List.Item>
        <List.Item icon={<Ionicons name="trash" />}>Delete</List.Item>
      </List>

      <HStack className="justify-end mt-6 hidden md:flex">
        <Button variant="ghost" onPress={onClose}>
          Cancel
        </Button>
      </HStack>
    </ActionSheet>
  );
};

export default FileMenu;
