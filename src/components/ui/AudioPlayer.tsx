import { AVPlaybackStatusSuccess, Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import jsmediatags from "jsmediatags/build2/jsmediatags";
import { MediaTags } from "@/types/mediaTags";
import Box from "./Box";
import Text from "./Text";
import { base64encode, cn, encodeUrl, getFilename } from "@/lib/utils";
import { Image } from "react-native";
import { useFilesContext } from "../pages/files/FilesContext";
import { HStack } from "./Stack";
import Button from "./Button";
import { Ionicons } from "./Icons";
import { router } from "expo-router";
import { Slider } from "@miblanchard/react-native-slider";
import bgImage from "@/assets/images/audioplayer-bg.jpeg";

type Props = {
  path: string;
  uri: string;
};

const AudioPlayer = ({ path, uri }: Props) => {
  const { files } = useFilesContext();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [curFileIdx, setFileIdx] = useState(-1);
  const [status, setStatus] = useState<AVPlaybackStatusSuccess | null>(null);
  const [mediaTags, setMediaTags] = useState<MediaTags | null>(null);
  const filename = getFilename(decodeURIComponent(uri));

  const playNext = (inc = 1) => {
    if (!files.length || curFileIdx < 0) {
      return;
    }

    const fileIdx = (curFileIdx + inc) % files.length;
    const file = files[fileIdx];
    // setPlayback({ uri: getFileUrl(file), path: file.path });
    router.setParams({ view: encodeUrl(file.path) });
  };

  const onPlaybackEnd = () => {
    playNext();
  };

  useEffect(() => {
    if (!files?.length) {
      return;
    }

    async function play() {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((st: AVPlaybackStatusSuccess) => {
          setStatus(st as any);
          if (st.didJustFinish) {
            onPlaybackEnd();
          }
        });

        await sound.playAsync();

        if (soundRef.current !== sound) {
          await sound.unloadAsync();
        }
      } catch (err) {
        if (err instanceof DOMException) {
          if (err.name === "NotSupportedError") {
            setTimeout(onPlaybackEnd, 3000);
          }
        }
      }
    }

    const fileIdx = files.findIndex((file) => path === file.path);
    setFileIdx(fileIdx);

    play();

    const tagsReader = new jsmediatags.Reader(uri + "&dl=true");
    setMediaTags(null);

    tagsReader.read({
      onSuccess: (result: any) => {
        const mediaTagsResult = { ...result };

        if (result?.tags?.picture) {
          const { data, format } = result.tags.picture;
          let base64String = "";
          for (let i = 0; i < data.length; i++) {
            base64String += String.fromCharCode(data[i]);
          }
          mediaTagsResult.picture = `data:${format};base64,${base64encode(
            base64String
          )}`;
          delete data?.tags?.picture;
        }

        setMediaTags(mediaTagsResult);
      },
    });

    return () => {
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [uri, path, files]);

  return (
    <Box className="flex-1 relative">
      <Box className="absolute -inset-10 -z-[1]">
        <Image
          source={mediaTags?.picture ? { uri: mediaTags?.picture } : bgImage}
          style={cn("absolute -inset-5 w-full h-full")}
          resizeMode="cover"
          blurRadius={10}
        />
      </Box>

      <Box className="absolute inset-0 z-[1] bg-black bg-opacity-50 flex flex-col items-center justify-center p-4 md:p-8">
        {mediaTags?.picture ? (
          <Image
            source={{ uri: mediaTags.picture }}
            style={cn("w-full flex-1 max-h-[256px] mb-8")}
            resizeMode="contain"
          />
        ) : null}

        <Text className="text-white text-lg sm:text-xl">Now Playing</Text>
        <Text className="text-white text-xl md:text-3xl mt-4" numberOfLines={1}>
          {mediaTags?.tags?.title || filename}
        </Text>
        {mediaTags?.tags?.artist ? (
          <Text className="text-white mt-2" numberOfLines={1}>
            {mediaTags.tags.artist}
          </Text>
        ) : null}

        <Slider
          minimumValue={0}
          maximumValue={100}
          value={
            ((status?.positionMillis || 0) / (status?.durationMillis || 1)) *
            100
          }
          containerStyle={cn("w-full my-4 md:my-8")}
          onValueChange={async (value) => {
            if (!soundRef.current) {
              return;
            }

            if (!status?.isPlaying) {
              await soundRef.current.playAsync();
            }

            const [progress] = value;
            const pos = (progress / 100.0) * (status?.durationMillis || 0);
            soundRef.current.setPositionAsync(pos);
          }}
        />

        <HStack className="gap-4">
          <Button
            icon={<Ionicons name="chevron-back" />}
            iconClassName="text-[32px] md:text-[40px]"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full"
            onPress={() => playNext(-1)}
          />
          <Button
            icon={<Ionicons name={status?.isPlaying ? "pause" : "play"} />}
            iconClassName="text-[40px] md:text-[48px]"
            className="w-20 h-20 md:w-24 md:h-24 rounded-full"
            onPress={() => {
              if (!soundRef.current) {
                return;
              }
              if (status?.isPlaying) {
                soundRef.current?.pauseAsync();
              } else {
                soundRef.current?.playAsync();
              }
            }}
          />
          <Button
            icon={<Ionicons name="chevron-forward" />}
            iconClassName="text-[32px] md:text-[40px]"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full"
            onPress={() => playNext()}
          />
        </HStack>
      </Box>
    </Box>
  );
};

export default AudioPlayer;
