export const filesDirList = process.env.FILE_DIRS
  ? process.env.FILE_DIRS.split(";").map((i) => ({
      name: i.split("/").at(-1),
      path: i,
    }))
  : [];

export function getFilePath(path?: string) {
  const pathSlices =
    path
      ?.replace(/\/{2,}/g, "/")
      .replace(/\/$/, "")
      .split("/") || [];
  const baseName = pathSlices[1] || null;
  const filePath = pathSlices.slice(2).join("/");
  const baseDir = filesDirList.find((i) => i.name === baseName)?.path;

  return {
    path: [baseDir || "", filePath].join("/").replace(/\/$/, ""),
    pathname: ["", baseName, filePath].join("/").replace(/\/$/, ""),
    baseName,
    baseDir,
    filePath,
  };
}
