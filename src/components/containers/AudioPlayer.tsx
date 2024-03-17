import { AVPlaybackStatusSuccess, Audio } from "expo-av";
import { useEffect, useMemo, useRef, useState } from "react";
import jsmediatags from "jsmediatags/build2/jsmediatags";
import { MediaTags } from "@/types/mediaTags";
import Box from "../ui/Box";
import Text from "../ui/Text";
import {
  base64encode,
  cn,
  encodeUrl,
  getFileType,
  getFilename,
} from "@/lib/utils";
import { FlatList, Image, Pressable } from "react-native";
import { useFilesContext } from "../pages/files/FilesContext";
import { HStack } from "../ui/Stack";
import Button from "../ui/Button";
import { Ionicons } from "../ui/Icons";
import { Slider } from "@miblanchard/react-native-slider";
import bgImage from "@/assets/images/audioplayer-bg.jpeg";
import { FileItem } from "@/types/files";
import Input from "@ui/Input";

type Props = {
  path: string;
  uri: string;
};

const AudioPlayer = ({ path, uri }: Props) => {
  const { files, setViewFile } = useFilesContext();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [curFileIdx, setFileIdx] = useState(-1);
  const [status, setStatus] = useState<AVPlaybackStatusSuccess | null>(null);
  const [mediaTags, setMediaTags] = useState<MediaTags | null>(null);
  const filename = getFilename(decodeURIComponent(uri));

  const playlist = useMemo(() => {
    return files.filter((f) => getFileType(f.name) === "audio");
  }, [files]);

  const playIdx = (idx: number) => {
    if (!playlist.length || idx < 0) {
      return;
    }

    const file = playlist[idx % playlist.length];
    if (file) {
      setViewFile(file);
    }
  };

  const playNext = (increment = 1) => {
    if (!playlist.length || curFileIdx < 0) {
      return;
    }

    playIdx(curFileIdx + increment);
  };

  useEffect(() => {
    if (!playlist?.length) {
      return;
    }

    const fileIdx = playlist.findIndex((file) => path === file.path);
    setFileIdx(fileIdx);

    const onNext = () => playIdx(fileIdx + 1);

    async function play() {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((st: AVPlaybackStatusSuccess) => {
          setStatus(st as any);

          if (st.didJustFinish) {
            onNext();
          }
        });

        await sound.playAsync();

        if (soundRef.current !== sound) {
          await sound.unloadAsync();
        }
      } catch (err) {
        if (err instanceof DOMException) {
          if (err.name === "NotSupportedError") {
            setTimeout(onNext, 3000);
          }
        }
      }
    }

    // function loadMediaTags() {
    //   const tagsReader = new jsmediatags.Reader(uri + "&dl=true");
    //   setMediaTags(null);

    //   tagsReader.read({
    //     onSuccess: (result: any) => {
    //       const mediaTagsResult = { ...result };

    //       if (result?.tags?.picture) {
    //         const { data, format } = result.tags.picture;
    //         let base64String = "";
    //         for (let i = 0; i < data.length; i++) {
    //           base64String += String.fromCharCode(data[i]);
    //         }
    //         mediaTagsResult.picture = `data:${format};base64,${base64encode(
    //           base64String
    //         )}`;
    //         delete data?.tags?.picture;
    //       }

    //       setMediaTags(mediaTagsResult);
    //     },
    //   });
    // }

    play();

    return () => {
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [uri, path, playlist]);

  return (
    <HStack className="flex-1 items-stretch">
      <Box className="flex-1 relative overflow-hidden">
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
          <Text
            className="text-white text-xl md:text-3xl mt-4"
            numberOfLines={1}
          >
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
            thumbStyle={cn("bg-blue-500")}
            trackStyle={cn("bg-white/30 rounded-full h-2")}
            minimumTrackTintColor="#6366F1"
            containerStyle={cn("w-full max-w-3xl mx-auto my-4 md:my-8")}
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

      <Playlist playlist={playlist} currentIdx={curFileIdx} playIdx={playIdx} />
    </HStack>
  );
};

type PlaylistProps = {
  playlist: FileItem[];
  currentIdx: number;
  playIdx: (idx: number) => void;
};

const Playlist = ({ playlist, currentIdx, playIdx }: PlaylistProps) => {
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    if (!search?.length) {
      return playlist;
    }
    return playlist.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, playlist]);

  return (
    <Box className="hidden md:flex w-1/3 max-w-[400px] bg-black">
      <HStack className="pl-6 pr-2 items-center">
        <Text className="text-2xl text-white py-4 flex-1" numberOfLines={1}>
          Playlist
        </Text>
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Search"
          placeholderTextColor="white"
          inputClassName="text-white"
        />
      </HStack>

      <FlatList
        data={list}
        keyExtractor={(i) => i.path}
        renderItem={({ item, index }) => (
          <PlaylistItem
            file={item}
            isCurrent={index === currentIdx}
            onPress={() => playIdx(index)}
          />
        )}
      />
    </Box>
  );
};

type PlaylistItemProps = {
  file: FileItem;
  isCurrent: boolean;
  onPress: () => void;
};

const PlaylistItem = ({ file, isCurrent, onPress }: PlaylistItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={cn(
        "py-4 px-5 border-b border-gray-800",
        isCurrent && "bg-[#323232]"
      )}
    >
      <Text className="text-white" numberOfLines={1}>
        {file.name}
      </Text>
    </Pressable>
  );
};

export default AudioPlayer;
