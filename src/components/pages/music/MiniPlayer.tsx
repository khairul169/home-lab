import { cn, getFilename } from "@/lib/utils";
import { audioPlayer, audioPlayerStore } from "@/stores/audioPlayerStore";
import { Slider } from "@miblanchard/react-native-slider";
import Box from "@ui/Box";
import Button from "@ui/Button";
import { Ionicons } from "@ui/Icons";
import { HStack } from "@ui/Stack";
import Text from "@ui/Text";
import React from "react";
import { Pressable } from "react-native";
import { useStore } from "zustand";

const MiniPlayer = () => {
  const { status, playlist, currentIdx, mediaTags } =
    useStore(audioPlayerStore);
  const current = playlist[currentIdx];
  const filename = getFilename(current?.path);

  if (!status?.isLoaded) {
    return null;
  }

  return (
    <>
      <Box className="w-full h-20 flex md:hidden" />
      <HStack className="absolute bottom-0 right-0 md:bottom-4 md:right-4 bg-white md:rounded-lg shadow-lg w-full max-w-sm">
        <Pressable
          style={cn("flex-1 p-4")}
          onPress={() => audioPlayerStore.setState({ expanded: true })}
        >
          <Text numberOfLines={1}>
            {mediaTags?.tags?.title || filename || "..."}
          </Text>
          <Slider
            minimumValue={0}
            maximumValue={100}
            value={
              ((status?.positionMillis || 0) / (status?.durationMillis || 1)) *
              100
            }
            containerStyle={{ height: 20, marginTop: 4 }}
            thumbStyle={cn("bg-transparent")}
            trackStyle={cn("bg-primary/30 rounded-full h-2")}
            minimumTrackTintColor="#6366F1"
          />
        </Pressable>

        <HStack className="pr-2">
          <Button
            variant="ghost"
            size="icon"
            icon={<Ionicons name="play-back" />}
            onPress={audioPlayer.prev}
          />
          <Button
            variant="ghost"
            size="icon"
            icon={<Ionicons name={status?.isPlaying ? "pause" : "play"} />}
            onPress={audioPlayer.togglePlay}
          />
          <Button
            variant="ghost"
            size="icon"
            icon={<Ionicons name="play-forward" />}
            onPress={audioPlayer.next}
          />
        </HStack>
      </HStack>
    </>
  );
};

export default MiniPlayer;
