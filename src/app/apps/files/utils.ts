import { API_BASEURL } from "@/lib/constants";
import authStore from "@/stores/authStore";
import { FileItem } from "@/types/files";

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
