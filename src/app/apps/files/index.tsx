import FileList from "@/components/pages/files/FileList";
import { useAsyncStorage } from "@/hooks/useAsyncStorage";
import api from "@/lib/api";
import { useAuth } from "@/stores/authStore";
import BackButton from "@ui/BackButton";
import Input from "@ui/Input";
import { Stack } from "expo-router";
import React from "react";
import { useMutation, useQuery } from "react-query";
import { openFile } from "./utils";
import FileDrop from "@/components/pages/files/FileDrop";
import { showToast } from "@/stores/toastStore";
import { HStack } from "@ui/Stack";
import Button from "@ui/Button";
import { Ionicons } from "@ui/Icons";

const FilesPage = () => {
  const { isLoggedIn } = useAuth();
  const [params, setParams] = useAsyncStorage("files", {
    path: "",
  });
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

  return (
    <>
      <Stack.Screen
        options={{ headerLeft: () => <BackButton />, title: "Files" }}
      />

      <HStack className="px-2 py-2 bg-white gap-2">
        <Button
          icon={<Ionicons name="chevron-back" />}
          disabled={parentPath == null}
          className="px-3 border-gray-300"
          labelClasses="text-gray-500"
          variant="outline"
          onPress={() => setParams({ ...params, path: parentPath })}
        />
        <Input
          placeholder="/"
          value={params.path}
          onChangeText={(path) => setParams({ path })}
          className="flex-1"
        />
      </HStack>

      <FileDrop onFileDrop={onFileDrop} isDisabled={upload.isLoading}>
        <FileList
          files={data}
          onSelect={(file) => {
            if (file.isDirectory) {
              return setParams({ ...params, path: file.path });
            }
            openFile(file);
          }}
        />
      </FileDrop>
    </>
  );
};

export default FilesPage;
