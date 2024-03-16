import FileList, { FileItem } from "@/components/pages/files/FileList";
import { useAsyncStorage } from "@/hooks/useAsyncStorage";
import api from "@/lib/api";
import authStore, { useAuth } from "@/stores/authStore";
import BackButton from "@ui/BackButton";
import Box from "@ui/Box";
import Input from "@ui/Input";
import { Stack } from "expo-router";
import React from "react";
import { useQuery } from "react-query";

const FilesPage = () => {
  const { isLoggedIn } = useAuth();
  const [params, setParams] = useAsyncStorage("files", {
    path: "",
  });
  const parentPath =
    params.path.length > 0
      ? params.path.split("/").slice(0, -1).join("/")
      : null;

  const { data } = useQuery({
    queryKey: ["app/files", params],
    queryFn: () => api.files.$get({ query: params }).then((r) => r.json()),
    enabled: isLoggedIn,
  });

  return (
    <>
      <Stack.Screen
        options={{ headerLeft: () => <BackButton />, title: "Files" }}
      />

      <Box className="px-2 py-2 bg-white">
        <Input
          placeholder="/"
          value={params.path}
          onChangeText={(path) => setParams({ path })}
        />
      </Box>

      <FileList
        files={data}
        onSelect={(file) => {
          if (file.path === "..") {
            return setParams({ ...params, path: parentPath });
          }
          if (file.isDirectory) {
            return setParams({ ...params, path: file.path });
          }

          downloadFile(file);
        }}
        canGoBack={parentPath != null}
      />
    </>
  );
};

async function downloadFile(file: FileItem) {
  const url = api.files.download.$url();
  url.searchParams.set("path", file.path);
  url.searchParams.set("token", authStore.getState().token);
  window.open(url.toString(), "_blank");
}

export default FilesPage;