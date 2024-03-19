import YTDL from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import fs from "node:fs";
import fetch from "node-fetch";
import path from "node:path";
import { slugify } from "./utils";
import { nanoid } from "nanoid";

const TMP_DIR = process.env.TMP_DIR || "/tmp/homelab";

const ytDownload = (url: string): Promise<YTDownloadFnResult> => {
  return new Promise((resolve, reject) => {
    const dl = YTDL(url, {
      quality: "highestaudio",
      filter: (i) => i.hasAudio,
    });

    dl.on("info", async (info: YTDL.videoInfo, format: YTDL.videoFormat) => {
      const type = format.container;

      // Download thumbnail
      const thumbnail = getBestThumbnail(info.videoDetails.thumbnails);
      const uid = nanoid();
      const thumbDest = `${TMP_DIR}/${uid}.jpeg`;
      const albumCover = await downloadFile(thumbnail.url, thumbDest);

      const filename = `${uid}.${type}`;
      const tmpSrc = `${TMP_DIR}/${filename}`;

      const onClean = () => {
        fs.unlinkSync(tmpSrc);
        if (albumCover) fs.unlinkSync(albumCover);
      };

      dl.pipe(fs.createWriteStream(tmpSrc));
      dl.on("end", () => {
        resolve({ info, path: tmpSrc, clean: onClean, album: albumCover });
      });
    });

    dl.on("progress", (_, progress: number, total: number) => {
      console.log("info", `${Math.round((progress / total) * 100)}%`);
    });

    dl.on("error", reject);
  });
};

type YTDownloadFnResult = {
  info: YTDL.videoInfo;
  path: string;
  album: string | null;
  clean: () => void;
};

const convertToAudio = (
  src: string,
  output: string,
  format = "mp3"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(src)
      .output(output)
      .format(format)
      .on("end", () => {
        resolve(output);
      });

    cmd.on("error", (err, stdout, stderr) => {
      console.log(`Cannot process video: ${err.message}`);
      console.log(stdout, stderr);
      reject(err);
    });

    // cmd.on("start", (cmdline) => {
    //   console.log("cmdline", cmdline);
    // });

    cmd.run();
  });
};

const embedMetadata = (
  src: string,
  output: string,
  title: string,
  album: string | null
) => {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(src)
      .output(output)
      .outputOptions(
        // '-c:a libmp3lame',
        "-id3v2_version",
        "3",
        "-write_id3v1",
        "1",
        "-metadata",
        `title=${title}`
        // '-metadata',
        // 'comment="Cover (front)"'
      )
      .on("end", () => {
        resolve(output);
      });

    if (album) {
      cmd.addInput(album);
      cmd.addOutputOptions(["-map 0:0", "-map 1:0"]);
    }

    cmd.on("error", (err, stdout, stderr) => {
      console.log(`Cannot process video: ${err.message}`);
      console.log(stdout, stderr);
      reject(err);
    });

    cmd.on("start", (cmdline) => {
      console.log("cmdline", cmdline);
    });

    cmd.run();
  });
};

type YT2MP3Options = {
  filename?: string;
  format?: string;
};

const yt2mp3 = async (url: string, outDir: string, options?: YT2MP3Options) => {
  let srcFile: YTDownloadFnResult | null = null;
  let tmpAudio: string | undefined;
  let result: string | undefined;

  try {
    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR, { recursive: true });
    }

    srcFile = await ytDownload(url);
    const { info } = srcFile;

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const { title } = info.videoDetails;
    const format = options?.format || "mp3";
    const tmpAudioPath = path.join(TMP_DIR, `${Date.now()}.${format}`);
    tmpAudio = await convertToAudio(srcFile.path, tmpAudioPath, format);

    const audioPath = path.join(
      outDir,
      options?.filename || `${slugify(title, false)}.${format}`
    );
    await embedMetadata(tmpAudio, audioPath, title, srcFile.album);

    result = audioPath;
  } catch (err) {
    throw err;
  } finally {
    // clean tmp files
    if (srcFile) {
      srcFile.clean();
    }

    if (tmpAudio) {
      fs.unlinkSync(tmpAudio);
    }
  }

  return result;
};

export const getVideoInfo = async (url: string) => {
  const info = await YTDL.getBasicInfo(url);
  const { videoDetails: details } = info;

  return {
    url: details.video_url,
    title: details.title,
    length: details.lengthSeconds,
    thumb: getBestThumbnail(details.thumbnails),
  };
};

function getBestThumbnail(thumbnails: YTDL.thumbnail[]) {
  let thumbnail = thumbnails[0] || null;

  thumbnails.forEach((thumb) => {
    if (!thumbnail) {
      thumbnail = thumb;
      return;
    }
    if (thumb.width > thumbnail.width || thumb.height > thumbnail.height) {
      thumbnail = thumb;
    }
  });

  return thumbnail;
}

async function downloadFile(url: string, out: string) {
  try {
    const res = await fetch(url);
    if (!res.ok || !res.body) {
      throw new Error(res.statusText);
    }

    res.body.pipe(fs.createWriteStream(out));
    return out;
  } catch (err) {
    console.log("err download file", err);
    return null;
  }
}

export default yt2mp3;
