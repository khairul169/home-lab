import { getFileUrl } from "@/app/apps/lib";
import { fetchAPI } from "@/lib/api";
import { API_BASEURL } from "@/lib/constants";
import { base64encode } from "@/lib/utils";
import { audioPlayer, audioPlayerStore } from "@/stores/audioPlayerStore";
import authStore from "@/stores/authStore";
import { AVPlaybackStatusSuccess, Audio } from "expo-av";
import { useEffect, useRef } from "react";
import { useStore } from "zustand";

const AudioPlayerProvider = () => {
  const { currentIdx, playlist, repeat, status } = useStore(audioPlayerStore);

  const soundRef = useRef<Audio.Sound | null>(null);

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

        sound.setIsLoopingAsync(repeat);
        sound.setOnPlaybackStatusUpdate((st: AVPlaybackStatusSuccess) => {
          audioPlayerStore.setState({ status: st as any });

          if (st.didJustFinish) {
            audioPlayer.next();
          }
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
    play();

    return () => {
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [currentIdx, playlist]);

  useEffect(() => {
    if (status?.isLoaded) {
      soundRef.current?.setIsLoopingAsync(repeat);
    }
  }, [repeat, status?.isLoaded]);

  return null;
};

export default AudioPlayerProvider;
