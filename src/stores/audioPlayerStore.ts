import { FileItem } from "@/types/files";
import { createStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AVPlaybackStatusSuccess, Audio } from "expo-av";
import { MediaTags } from "@/types/mediaTags";
import { getFileType } from "@/lib/utils";

type PlaylistItem = FileItem & {
  idx: number;
};

type AudioPlayerStore = {
  playlist: PlaylistItem[];
  currentIdx: number;
  repeat: boolean;
  shuffle: boolean;
  sound: Audio.Sound | null;
  status: AVPlaybackStatusSuccess | null;
  mediaTags: MediaTags | null;
  expanded: boolean;
  shouldPlay: boolean;
};

export const audioPlayerStore = createStore(
  persist<AudioPlayerStore>(
    () => ({
      playlist: [],
      currentIdx: -1,
      repeat: false,
      shuffle: false,
      sound: null,
      status: null,
      mediaTags: null,
      expanded: false,
      shouldPlay: false,
    }),
    {
      name: "audioPlayer",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        ...state,
        sound: null,
        status: null,
        mediaTags: null,
        expanded: false,
        shouldPlay: false,
      }),
    }
  )
);

const play = (files: FileItem[], idx: number) => {
  const playlist: PlaylistItem[] = files
    .map((f, idx) => ({ ...f, idx }))
    .filter((f) => getFileType(f.name) === "audio");
  const currentIdx = playlist.findIndex((f) => f.idx === idx);

  audioPlayerStore.setState({
    playlist: playlist.map((f, idx) => ({ ...f, idx })),
    currentIdx,
    status: null,
    mediaTags: null,
    shouldPlay: true,
  });
};

const advanceBy = (increment: number) => {
  const { playlist, currentIdx, shuffle } = audioPlayerStore.getState();
  if (playlist.length > 0 && currentIdx >= 0) {
    const idx = shuffle
      ? Math.floor(Math.random() * playlist.length)
      : (currentIdx + increment) % playlist.length;
    audioPlayerStore.setState({ currentIdx: idx });
  }
};

const togglePlay = async () => {
  const { sound, status, shouldPlay } = audioPlayerStore.getState();

  if (!shouldPlay || !sound || !status?.isPlaying) {
    console.log("shoud play toggle");
    audioPlayerStore.setState({ shouldPlay: true });
    return;
  }

  if (!sound) {
    return;
  }

  if (status?.isPlaying) {
    await sound.pauseAsync();
  } else {
    await sound.playAsync();
  }
};

const next = () => advanceBy(1);
const prev = () => advanceBy(-1);

const seek = async (progress: number) => {
  const { sound, status } = audioPlayerStore.getState();
  if (!sound) {
    return;
  }

  if (!status.isPlaying) {
    await sound.playAsync();
  }

  const pos = (progress / 100.0) * (status?.durationMillis || 0);
  sound.setPositionAsync(pos);
};

const expand = () => {
  audioPlayerStore.setState({ expanded: true });
};

export const audioPlayer = {
  store: audioPlayerStore,
  play,
  togglePlay,
  prev,
  next,
  seek,
  expand,
};
