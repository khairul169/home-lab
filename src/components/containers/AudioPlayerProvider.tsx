import { getFileUrl } from "@/app/apps/lib";
import { fetchAPI } from "@/lib/api";
import { API_BASEURL } from "@/lib/constants";
import { audioPlayer, audioPlayerStore } from "@/stores/audioPlayerStore";
import authStore from "@/stores/authStore";
import { AVPlaybackStatusSuccess, Audio } from "expo-av";
import { useEffect, useRef } from "react";
import { useStore } from "zustand";

const AudioPlayerProvider = () => {
  const { currentIdx, playlist, repeat, status, shouldPlay } =
    useStore(audioPlayerStore);
  const soundRef = useRef<Audio.Sound | null>(null);
  const lastStatusRef = useRef<Date>(new Date());

  useEffect(() => {
    if (!playlist?.length || currentIdx < 0) {
      return;
    }

    const fileData = playlist[currentIdx];
    const uri = getFileUrl(fileData.path);

    async function play() {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri });
        soundRef.current = sound;
        audioPlayerStore.setState({ sound });

        sound.setProgressUpdateIntervalAsync(1000);
        sound.setIsLoopingAsync(repeat);
        sound.setOnPlaybackStatusUpdate((st: AVPlaybackStatusSuccess) => {
          const curDate = new Date();

          if (st.didJustFinish) {
            lastStatusRef.current = curDate;
            return audioPlayer.next();
          }

          const diff = curDate.getTime() - lastStatusRef.current.getTime();
          if (diff < 1000) {
            return;
          }

          lastStatusRef.current = curDate;
          audioPlayerStore.setState({ status: st as any });
        });

        await sound.playAsync();

        if (soundRef.current !== sound) {
          await sound.unloadAsync();
        }
      } catch (err) {
        if (err instanceof DOMException) {
          if (err.name === "NotSupportedError") {
            setTimeout(audioPlayer.next, 1000);
          }
        }
      }
    }

    async function loadMediaTags() {
      audioPlayerStore.setState({ mediaTags: null });

      try {
        const url =
          `${API_BASEURL}/files/id3-tags${fileData.path}?token=` +
          authStore.getState().token;

        const res = await fetchAPI(url);
        const data = await res.json();
        audioPlayerStore.setState({ mediaTags: data });
      } catch (err) {}
    }

    loadMediaTags();

    if (shouldPlay) {
      play();
    }

    return () => {
      const sound = soundRef.current;
      if (sound) {
        sound.unloadAsync();
        sound.setOnPlaybackStatusUpdate(null);
        soundRef.current = null;
      }
    };
  }, [currentIdx, playlist, shouldPlay]);

  useEffect(() => {
    if (status?.isLoaded && soundRef.current) {
      soundRef.current.setIsLoopingAsync(repeat);
    }
  }, [repeat, status?.isLoaded]);

  return null;
};

export default AudioPlayerProvider;
