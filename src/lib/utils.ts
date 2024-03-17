import { ClassInput, create as createTwrnc } from "twrnc";
import base64 from "base-64";
import utf8 from "utf8";

export const tw = createTwrnc(require(`../../tailwind.config.js`));

export const cn = (...args: ClassInput[]) => {
  if (Array.isArray(args[0])) {
    return tw.style(...args[0]);
  }

  return tw.style(...args);
};

export const base64encode = (str?: string | null) => {
  return str ? base64.encode(str) : null;
};

export const base64decode = (str?: string | null) => {
  return str ? base64.decode(str) : null;
};

export const encodeUrl = (str?: string | null) => {
  return str ? encodeURIComponent(base64encode(utf8.encode(str))) : null;
};

export const decodeUrl = (str?: string | null) => {
  return str ? decodeURIComponent(utf8.decode(base64decode(str))) : null;
};

export const getFileType = (path?: string | null) => {
  const ext = path?.split(".").pop();
  const videoExts = "mp4,mkv,webm,avi,mov";
  if (videoExts.split(",").includes(ext)) {
    return "video";
  }

  const imgExts = "jpeg,jpg,png,gif,webp,avif,svg,bmp,ico,tif,tiff";
  if (imgExts.split(",").includes(ext)) {
    return "image";
  }

  const docExts = "pdf,doc,docx,xls,xlsx,ppt,pptx";
  if (docExts.split(",").includes(ext)) {
    return "document";
  }

  const audioExts = "mp3,ogg,wav,flac,aac,amr";
  if (audioExts.split(",").includes(ext)) {
    return "audio";
  }

  return false;
};

export const getFilename = (path?: string | null) => {
  let fname = path.split("/").pop()?.split(".").slice(0, -1).join(".");
  fname = fname.substring(0, fname.indexOf("?"));
  return fname;
};
