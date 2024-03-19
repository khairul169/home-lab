import React, { useEffect, useState } from "react";
import ActionButton from "./ActionButton";
import { Ionicons } from "@ui/Icons";
import Modal, { createModal } from "@ui/Modal";
import { HStack, VStack } from "@ui/Stack";
import Button from "@ui/Button";
import Box from "@ui/Box";
import { useFilesContext } from "./FilesContext";
import Input from "@ui/Input";
import { useMutation, useQuery } from "react-query";
import api from "@/lib/api";
import { showToast } from "@/stores/toastStore";
import Text from "@ui/Text";

const modal = createModal();

const FileUpload = () => {
  // const [type, setType] = useState<"file" | "youtube" | "url">("file");
  const [type, setType] = useState<"file" | "youtube" | "url">("youtube");

  return (
    <>
      <ActionButton
        icon={<Ionicons name="cloud-upload-outline" />}
        onPress={() => modal.open()}
      />
      <Modal modal={modal} className="max-w-xl" title="Upload File">
        <HStack className="gap-2 mt-4">
          {/* <Button
            variant={type === "file" ? "default" : "ghost"}
            onPress={() => setType("file")}
          >
            File
          </Button> */}
          <Button
            variant={type === "youtube" ? "default" : "ghost"}
            onPress={() => setType("youtube")}
          >
            Youtube
          </Button>
          {/* <Button
            variant={type === "url" ? "default" : "ghost"}
            onPress={() => setType("url")}
          >
            URL
          </Button> */}
        </HStack>

        <Box className="mt-4">
          {type === "file" && <FileDownload />}
          {type === "youtube" && <YoutubeDownload />}
          {type === "url" && <UrlDownload />}
        </Box>
      </Modal>
    </>
  );
};

const FileDownload = () => {
  return null;
};

type YtDlTask = {
  id: string;
  url: string;
  title: string;
  path: string;
  length: string;
  thumb: string;
  status?: "pending" | "resolved" | "rejected";
};

const YoutubeDownload = () => {
  const { path } = useFilesContext();
  const [url, setUrl] = useState("");
  const [tasks, setTasks] = useState<YtDlTask[]>([]);

  const start = useMutation({
    mutationFn: async () => {
      const res = await api.files.ytdl.$post({ json: { path, url } });
      return res.json();
    },
    onSuccess: (data) => {
      setTasks((i) => [data, ...i]);
      setUrl("");
    },
    onError: (err) => {
      showToast((err as any)?.message || "An error occured!", {
        type: "danger",
      });
    },
  });

  return (
    <Box>
      <HStack className="gap-3">
        <Input
          placeholder="URL"
          className="flex-1"
          value={url}
          onChangeText={setUrl}
        />
        <Button
          variant="default"
          icon={<Ionicons name="cloud-upload" />}
          disabled={!url.length || start.isLoading}
          onPress={() => start.mutate()}
        />
      </HStack>

      {tasks.length > 0 && (
        <VStack className="gap-2 mt-4">
          {tasks.map((task) => (
            <YtDownloadTaskStatus key={task.id} task={task} />
          ))}
        </VStack>
      )}
    </Box>
  );
};

const YtDownloadTaskStatus = ({ task }: { task: YtDlTask }) => {
  const { refresh } = useFilesContext();
  const [isPending, setPending] = useState(true);

  const { data, isError } = useQuery({
    queryKey: ["ytdl", task.id],
    queryFn: async () =>
      api.files.ytdl[":id"]
        .$get({ param: { id: task.id } })
        .then((i) => i.json()),
    enabled: isPending,
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (data && ["rejected", "resolved"].includes(data.status)) {
      setPending(false);
      refresh();
    }
  }, [data, isError, refresh]);

  const status = data?.status || task.status;

  return (
    <HStack className="gap-2">
      {!status ? <Ionicons name="hourglass" size={24} /> : null}
      {status === "pending" ? (
        <Ionicons size={24} name="sync-circle-outline" />
      ) : null}
      {status === "resolved" ? (
        <Ionicons name="checkmark-circle" size={24} color="green" />
      ) : null}
      {status === "rejected" ? (
        <Ionicons name="close-circle" size={24} color="red" />
      ) : null}

      <Text className="text-lg font-medium flex-1" numberOfLines={1}>
        {task.title}
      </Text>
    </HStack>
  );
};

const UrlDownload = () => {
  return null;
};

export default React.memo(FileUpload);
