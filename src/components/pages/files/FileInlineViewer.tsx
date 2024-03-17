import { cn, getFileType } from "@/lib/utils";
import Box from "@ui/Box";
import Button from "@ui/Button";
import { Ionicons } from "@ui/Icons";
import { HStack } from "@ui/Stack";
import Text from "@ui/Text";
import React, { useRef } from "react";
import Modal from "react-native-modal";
import { Video, ResizeMode } from "expo-av";
import { getFileUrl, openFile } from "@/app/apps/files/utils";
import { Image } from "react-native";
import AudioPlayer from "@/components/containers/AudioPlayer";
import { FileItem } from "@/types/files";

type Props = {
  file?: FileItem | null;
  onClose?: () => void;
};

const FileViewer = ({ file }: Pick<Props, "file">) => {
  const videoPlayerRef = useRef<Video>(null!);
  const fileType = getFileType(file.path);
  const uri = getFileUrl(file.path);

  if (fileType === "video") {
    return (
      <Video
        ref={videoPlayerRef}
        style={cn("w-full flex-1 overflow-hidden relative")}
        videoStyle={cn("absolute top-0 left-0 w-full h-full")}
        source={{ uri }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
      />
    );
  }

  if (fileType === "audio") {
    return <AudioPlayer path={file.path} uri={uri} />;
  }

  if (fileType === "image") {
    return (
      <Image
        source={{ uri }}
        style={cn("w-full flex-1")}
        resizeMode="contain"
      />
    );
  }

  return (
    <Box className="w-full flex-1 flex flex-col items-center justify-center">
      <Button onPress={() => openFile(file.path)}>Open File</Button>
    </Box>
  );
};

const FileInlineViewer = ({ file, onClose }: Props) => {
  const filename = file?.path?.split("/").pop();

  return (
    <Modal
      isVisible={!!file?.path}
      onBackButtonPress={onClose}
      style={cn("m-0")}
    >
      <Box className="flex-1 w-full bg-gray-950">
        <HStack className="gap-2 p-2 bg-black border-b border-gray-800 relative z-10">
          <Button
            icon={<Ionicons name="arrow-back" />}
            iconClassName="text-white"
            onPress={onClose}
            variant="ghost"
          />
          <Text className="text-white flex-1" numberOfLines={1}>
            {filename}
          </Text>

          <Button
            icon={<Ionicons name="download-outline" />}
            iconClassName="text-white text-xl"
            className="px-3"
            onPress={() => openFile(file?.path, true)}
            variant="ghost"
          />
          <Button
            icon={<Ionicons name="open-outline" />}
            iconClassName="text-white text-xl"
            className="px-3"
            onPress={() => openFile(file?.path)}
          />
        </HStack>

        {file ? <FileViewer file={file} /> : null}
      </Box>
    </Modal>
  );
};

export default FileInlineViewer;
