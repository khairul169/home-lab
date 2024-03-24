import FileList from "@/components/pages/files/FileList";
import { useAsyncStorage } from "@/hooks/useAsyncStorage";
import api from "@/lib/api";
import { useAuth } from "@/stores/authStore";
import BackButton from "@ui/BackButton";
import Input from "@ui/Input";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { useMutation, useQuery } from "react-query";
import FileDrop from "@/components/pages/files/FileDrop";
import { showToast } from "@/stores/toastStore";
import { HStack } from "@ui/Stack";
import Button from "@ui/Button";
import { Ionicons } from "@ui/Icons";
import FileInlineViewer from "@/components/pages/files/FileInlineViewer";
import { FilesContext } from "@/components/pages/files/FilesContext";
import { FileItem } from "@/types/files";
import Head from "@/components/utility/Head";
import Container from "@ui/Container";
import FileUpload from "@/components/pages/files/FileUpload";
import ActionButton from "@/components/pages/files/ActionButton";
import { getFileType } from "@/lib/utils";
import { audioPlayer } from "@/stores/audioPlayerStore";

const FilesPage = () => {
  const { isLoggedIn } = useAuth();
  const [params, setParams] = useAsyncStorage("files", {
    path: "",
  });
  const [viewFile, setViewFile] = useState<FileItem | null>(null);
  const parentPath =
    params.path.length > 0
      ? params.path.split("/").slice(0, -1).join("/")
      : null;

  const { data, refetch } = useQuery({
    queryKey: ["app/files", params],
    queryFn: () => api.files.$get({ query: params }).then((r) => r.json()),
    enabled: isLoggedIn,
  });

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      const form: any = {
        path: params.path,
        size: files.length,
      };

      files.forEach((file, idx) => {
        form[`files.${idx}`] = file;
      });

      const res = await api.files.upload.$post({ form });
      return res.json();
    },
    onSuccess: () => {
      showToast("Upload success!");
      refetch();
    },
  });

  const onFileDrop = (files: File[]) => {
    if (!upload.isLoading) {
      upload.mutate(files);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <FilesContext.Provider
      value={{
        path: params.path,
        files: data,
        viewFile,
        setViewFile,
        refresh: refetch,
      }}
    >
      <Head title="Files" />
      <Stack.Screen
        options={{ headerLeft: () => <BackButton />, title: "Files" }}
      />

      <Container className="flex-1">
        <HStack className="px-2 py-2 bg-white gap-2">
          <ActionButton
            icon={<Ionicons name="chevron-back" />}
            disabled={parentPath == null}
            onPress={() => setParams({ path: parentPath })}
          />
          <ActionButton
            icon={<Ionicons name="home-outline" />}
            onPress={() => setParams({ path: "" })}
          />
          <Input
            placeholder="/"
            value={params.path}
            onChangeText={(path) => setParams({ path })}
            className="flex-1"
          />
          <FileUpload />
        </HStack>

        <FileDrop onFileDrop={onFileDrop} isDisabled={upload.isLoading}>
          <FileList
            files={data}
            onSelect={(file, idx) => {
              if (file.isDirectory) {
                return setParams({ path: file.path });
              }

              const fileType = getFileType(file.path);
              if (fileType === "audio") {
                audioPlayer.expand();
                return audioPlayer.play(data, idx);
              }

              setViewFile(file);
            }}
          />
        </FileDrop>
      </Container>

      <FileInlineViewer file={viewFile} onClose={() => setViewFile(null)} />
    </FilesContext.Provider>
  );
};

export default FilesPage;
