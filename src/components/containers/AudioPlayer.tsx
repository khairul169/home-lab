import { AVPlaybackStatusSuccess, Audio } from "expo-av";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
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
import { useAsyncStorage } from "@/hooks/useAsyncStorage";

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
  const [playback, setPlayback] = useAsyncStorage("playback", {
    repeat: false,
    shuffle: false,
  });
  const filename = getFilename(decodeURIComponent(uri));

  const playlist = useMemo(() => {
    let items = files.filter((f) => getFileType(f.name) === "audio");

    if (playback.shuffle) {
      items = items.sort(() => Math.random() - 0.5);
    }

    return items;
  }, [files, playback.shuffle]);

  const playIdx = (idx: number) => {
    if (!playlist.length || idx < 0) {
      return;
    }

    const file = playlist[idx % playlist.length];
    if (file) {
      setViewFile(file);
    }
  };

  const playNext = (increment = 1, startIdx?: number) => {
    const curIdx = startIdx ?? curFileIdx;
    if (!playlist.length || curIdx < 0) {
      return;
    }
    playIdx(curIdx + increment);
  };

  useEffect(() => {
    if (!playlist?.length) {
      return;
    }

    const fileIdx = playlist.findIndex((file) => path === file.path);
    setFileIdx(fileIdx);

    const onNext = () => playNext(1, fileIdx);

    async function play() {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri });
        soundRef.current = sound;

        sound.setIsLoopingAsync(playback.repeat);
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

    function loadMediaTags() {
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
    }

    loadMediaTags();
    play();

    return () => {
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [uri, path, playlist]);

  useEffect(() => {
    if (status?.isLoaded) {
      soundRef.current?.setIsLoopingAsync(playback.repeat);
    }
  }, [playback.repeat, status?.isLoaded]);

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

          <Box className="w-full max-w-3xl mx-auto my-4 md:my-8">
            <Slider
              minimumValue={0}
              maximumValue={100}
              value={
                ((status?.positionMillis || 0) /
                  (status?.durationMillis || 1)) *
                100
              }
              thumbStyle={cn("bg-blue-500")}
              trackStyle={cn("bg-white/30 rounded-full h-2")}
              minimumTrackTintColor="#6366F1"
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
            <HStack className="justify-between">
              <Text className="text-white">
                {formatTime(status?.positionMillis || 0)}
              </Text>
              <Text className="text-white">
                {formatTime(status?.durationMillis || 0)}
              </Text>
            </HStack>
          </Box>

          <HStack className="gap-4">
            <Button
              icon={<Ionicons name="repeat" />}
              iconClassName={`text-[24px] md:text-[32px] text-white ${
                playback.repeat ? "opacity-100" : "opacity-50"
              }`}
              variant="ghost"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full"
              onPress={() => setPlayback({ repeat: !playback.repeat })}
            />
            <Button
              icon={<Ionicons name="play-back" />}
              iconClassName="text-[24px] md:text-[32px] text-white"
              variant="ghost"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full"
              onPress={() => playNext(-1)}
            />
            <Button
              icon={<Ionicons name={status?.isPlaying ? "pause" : "play"} />}
              iconClassName="text-[32px] md:text-[36px]"
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
              icon={<Ionicons name="play-forward" />}
              iconClassName="text-[24px] md:text-[32px] text-white"
              variant="ghost"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full"
              onPress={() => playNext()}
            />
            <Button
              icon={<Ionicons name="shuffle" />}
              iconClassName={`text-[24px] md:text-[32px] text-white ${
                playback.shuffle ? "opacity-100" : "opacity-50"
              }`}
              variant="ghost"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full"
              onPress={() => setPlayback({ shuffle: !playback.shuffle })}
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

const PLAYLIST_ITEM_HEIGHT = 49;

const Playlist = ({ playlist, currentIdx, playIdx }: PlaylistProps) => {
  const containerRef = useRef<any>();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (currentIdx >= 0) {
      containerRef.current?.scrollToIndex({
        index: currentIdx,
        animated: true,
      });
    }
  }, [currentIdx]);

  const list = useMemo(() => {
    const items = playlist.map((i, idx) => ({ ...i, idx }));

    if (!search?.length) {
      return items;
    }

    return items.filter((i) =>
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
        ref={containerRef}
        data={list}
        keyExtractor={(i) => i.path}
        renderItem={({ item }) => (
          <PlaylistItem
            file={item}
            isCurrent={item.idx === currentIdx}
            onPress={() => playIdx(item.idx)}
          />
        )}
        onScrollToIndexFailed={({ index }) => {
          containerRef.current?.scrollToOffset({
            offset: (index ?? 0) * PLAYLIST_ITEM_HEIGHT,
            animated: true,
          });
        }}
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

function formatTime(time: number) {
  const minutes = Math.floor(time / 60 / 1000);
  const seconds = Math.floor((time / 1000) % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default AudioPlayer;
