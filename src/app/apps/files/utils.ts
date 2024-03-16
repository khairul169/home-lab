import { API_BASEURL } from "@/lib/constants";
import authStore from "@/stores/authStore";
import { FileItem } from "@/types/files";

export function openFile(file: FileItem, dl = false) {
  const url = getFileUrl(file, dl);
  window.open(url, "_blank");
}

export function getFileUrl(file: FileItem, dl = false) {
  const url = new URL(API_BASEURL + "/files/download" + file.path);
  url.searchParams.set("token", authStore.getState().token);
  dl && url.searchParams.set("dlmode", "true");
  return url.toString();
}
