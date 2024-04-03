import React from "react";
import { createStore, useStore } from "zustand";
import { FileItem } from "@/types/files";
import Text from "@ui/Text";
import List from "@ui/List";
import { Ionicons } from "@ui/Icons";
import ActionSheet from "@ui/ActionSheet";
import { HStack } from "@ui/Stack";
import Button from "@ui/Button";
import { openFile } from "@/app/apps/lib";
import { showDialog } from "@/stores/dialogStore";
import api from "@/lib/api";
import { useMutation } from "react-query";
import { useFilesContext } from "./FilesContext";
import { showToast } from "@/stores/toastStore";

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
  const { refresh } = useFilesContext();

  const deleteMutation = useMutation({
    mutationFn: (json: any) => api.files.delete.$delete({ json }),
    onSuccess: () => {
      refresh();
      showToast("File deleted!");
    },
  });

  const onDownload = () => {
    openFile(file, true);
    onClose();
  };

  const onDelete = () => {
    showDialog(
      "Delete file",
      "Are you sure you want to delete this file?",
      () => deleteMutation.mutate({ path: file?.path })
    );
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
        <List.Item icon={<Ionicons name="trash" />} onPress={onDelete}>
          Delete
        </List.Item>
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
