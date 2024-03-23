import { getFileUrl } from "@/app/apps/lib";
import { base64encode } from "@/lib/utils";
import { audioPlayer, audioPlayerStore } from "@/stores/audioPlayerStore";
import { AVPlaybackStatusSuccess, Audio } from "expo-av";
import jsmediatags from "jsmediatags/build2/jsmediatags";
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

    function loadMediaTags() {
      const tagsReader = new jsmediatags.Reader(uri + "&dl=true");
      audioPlayerStore.setState({ mediaTags: null });

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

          audioPlayerStore.setState({ mediaTags: mediaTagsResult });
        },
      });
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
