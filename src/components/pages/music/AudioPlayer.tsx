import React, { useEffect, useMemo, useRef, useState } from "react";
import Box from "../../ui/Box";
import Text from "../../ui/Text";
import { cn, getFilename } from "@/lib/utils";
import { FlatList, Image, Pressable } from "react-native";
import { HStack } from "../../ui/Stack";
import Button from "../../ui/Button";
import { Ionicons } from "../../ui/Icons";
import { Slider } from "@miblanchard/react-native-slider";
import bgImage from "@/assets/images/audioplayer-bg.jpeg";
import { FileItem } from "@/types/files";
import Input from "@ui/Input";
import { useStore } from "zustand";
import { audioPlayer, audioPlayerStore } from "@/stores/audioPlayerStore";
import Modal from "react-native-modal";
import { useQuery } from "react-query";
import { API_BASEURL } from "@/lib/constants";
import authStore from "@/stores/authStore";
import { fetchAPI } from "@/lib/api";
import { MediaTags } from "@/types/mediaTags";

const AudioPlayer = () => {
  const expanded = useStore(audioPlayerStore, (i) => i.expanded);
  const onClose = () => audioPlayerStore.setState({ expanded: false });

  return (
    <Modal
      isVisible={expanded}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={cn("m-0")}
    >
      <AudioPlayerView onClose={onClose} />
    </Modal>
  );
};

const AudioPlayerView = React.memo(({ onClose }: { onClose: () => void }) => {
  const { playlist, currentIdx, status, repeat, shuffle, mediaTags } =
    useStore(audioPlayerStore);

  const current = playlist[currentIdx];
  const filename = getFilename(current?.path);

  return (
    <Box className="flex-1 items-stretch relative">
      <Box className="absolute -inset-10 -z-[1]">
        <Image
          source={mediaTags?.image ? { uri: mediaTags.image } : bgImage}
          style={cn("absolute -inset-5 w-full h-full")}
          resizeMode="cover"
          blurRadius={10}
        />
      </Box>

      <HStack className="absolute inset-0 z-[1] bg-black bg-opacity-50 items-stretch">
        <Button
          icon={<Ionicons name="arrow-back" />}
          iconClassName="text-white text-2xl"
          variant="ghost"
          className="absolute top-4 left-0 z-10"
          size="lg"
          onPress={onClose}
        />

        <Box className="flex flex-col items-center justify-center p-8 pt-20 flex-1 overflow-hidden">
          {mediaTags?.image ? (
            <Box className="aspect-square flex-1 max-h-[400px] mb-8">
              <Image
                source={{ uri: mediaTags.image }}
                style={cn("w-full h-full")}
                resizeMode="cover"
              />
            </Box>
          ) : null}

          <Text className="text-white text-lg sm:text-xl">Now Playing</Text>
          <Text
            className="text-white text-xl md:text-3xl mt-4"
            numberOfLines={1}
          >
            {mediaTags?.title || filename}
          </Text>
          {mediaTags?.artist ? (
            <Text className="text-white mt-2" numberOfLines={1}>
              {mediaTags.artist}
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
              onValueChange={(value) => {
                const [progress] = value;
                audioPlayer.seek(progress);
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

          <HStack className="md:gap-4">
            <Button
              icon={<Ionicons name="repeat" />}
              iconClassName={`text-[24px] md:text-[32px] text-white ${
                repeat ? "opacity-100" : "opacity-50"
              }`}
              variant="ghost"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full"
              onPress={() => audioPlayerStore.setState({ repeat: !repeat })}
            />
            <Button
              icon={<Ionicons name="play-back" />}
              iconClassName="text-[24px] md:text-[32px] text-white"
              variant="ghost"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full"
              onPress={audioPlayer.prev}
            />
            <Button
              icon={<Ionicons name={status?.isPlaying ? "pause" : "play"} />}
              iconClassName="text-[32px] md:text-[36px]"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full"
              onPress={audioPlayer.togglePlay}
            />
            <Button
              icon={<Ionicons name="play-forward" />}
              iconClassName="text-[24px] md:text-[32px] text-white"
              variant="ghost"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full"
              onPress={audioPlayer.next}
            />
            <Button
              icon={<Ionicons name="shuffle" />}
              iconClassName={`text-[24px] md:text-[32px] text-white ${
                shuffle ? "opacity-100" : "opacity-50"
              }`}
              variant="ghost"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full"
              onPress={() => audioPlayerStore.setState({ shuffle: !shuffle })}
            />
          </HStack>
        </Box>

        <Playlist />
      </HStack>
    </Box>
  );
});

const PLAYLIST_ITEM_HEIGHT = 82;

const Playlist = React.memo(() => {
  const playlist = useStore(audioPlayerStore, (i) => i.playlist);
  const currentIdx = useStore(audioPlayerStore, (i) => i.currentIdx);
  const containerRef = useRef<any>();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (currentIdx >= 0) {
      containerRef.current?.scrollToOffset({
        offset: currentIdx * PLAYLIST_ITEM_HEIGHT,
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
    <Box className="hidden md:flex w-1/3 max-w-[400px] p-4">
      <Box className="bg-black/30 rounded-xl flex-1 border border-white/20 overflow-hidden">
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
          contentContainerStyle={cn("px-4")}
          data={list}
          keyExtractor={(i) => i.path}
          renderItem={({ item }) => (
            <PlaylistItem
              file={item}
              isCurrent={item.idx === currentIdx}
              onPress={() =>
                audioPlayerStore.setState({ currentIdx: item.idx })
              }
            />
          )}
        />
      </Box>
    </Box>
  );
});

type PlaylistItemProps = {
  file: FileItem;
  isCurrent: boolean;
  onPress: () => void;
};

const PlaylistItem = ({ file, isCurrent, onPress }: PlaylistItemProps) => {
  const url =
    `${API_BASEURL}/files/id3-tags${file.path}?token=` +
    authStore.getState().token;
  const { data: id3Tags } = useQuery<MediaTags>({
    queryKey: ["id3-tags", file.path],
    queryFn: () => fetchAPI(url).then((i) => i.json()),
  });

  return (
    <Pressable
      onPress={onPress}
      style={cn(
        "mb-4 flex flex-row items-center gap-4 border border-transparent",
        isCurrent && "bg-white/10 border-white/20 rounded-lg overflow-hidden"
      )}
    >
      <Box className="bg-gray-800 w-16 h-16 flex items-center justify-center">
        {id3Tags?.image ? (
          <Image
            source={{ uri: id3Tags.image }}
            style={cn("w-full h-full")}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="musical-notes" style={cn("text-white text-2xl")} />
        )}
      </Box>
      <Box className="py-2 flex-1">
        <Text className="text-white font-bold" numberOfLines={1}>
          {id3Tags?.title || file.name}
        </Text>
        {id3Tags?.artist ? (
          <Text className="text-white mt-2" numberOfLines={1}>
            {id3Tags?.artist}
          </Text>
        ) : null}
      </Box>
    </Pressable>
  );
};

function formatTime(time: number) {
  const minutes = Math.floor(time / 60 / 1000);
  const seconds = Math.floor((time / 1000) % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default React.memo(AudioPlayer);
