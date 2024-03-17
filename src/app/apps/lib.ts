// src/app/apps/lib.ts

import api from "@/lib/api";
import { showToast } from "@/stores/toastStore";
import { API_BASEURL } from "@/lib/constants";
import authStore from "@/stores/authStore";
import { FileItem } from "@/types/files";

export const wakePcUp = async () => {
  try {
    await api.apps.wakepc.$post();
    showToast("Waking up PC...");
  } catch (err) {
    showToast("Cannot wake up the PC!", { type: "danger" });
  }
};

export function openFile(file: FileItem | string, dl = false) {
  const url = getFileUrl(file, dl);
  window.open(url, "_blank");
}

export function getFileUrl(file: FileItem | string, dl = false) {
  const filepath = typeof file === "string" ? file : file.path;
  const url = new URL(API_BASEURL + "/files/download" + filepath);
  url.searchParams.set("token", authStore.getState().token);
  dl && url.searchParams.set("dl", "true");
  return url.toString();
}

export function openFullscreen(elem: any) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE11 */
    elem.msRequestFullscreen();
  }
}

/* Close fullscreen */
export function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    /* Safari */
    (document as any).webkitExitFullscreen();
  } else if ((document as any).msExitFullscreen) {
    /* IE11 */
    (document as any).msExitFullscreen();
  }
}
