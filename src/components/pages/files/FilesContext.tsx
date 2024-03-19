import { FileItem } from "@/types/files";
import { createContext, useContext } from "react";

type FilesContextType = {
  path: string;
  files: FileItem[];
  viewFile: FileItem | null;
  setViewFile: (file: FileItem | null) => void;
  refresh: () => void;
};

export const FilesContext = createContext<FilesContextType>({
  path: "",
  files: [],
  viewFile: null,
  setViewFile: () => null,
  refresh: () => null,
});

export const useFilesContext = () => useContext(FilesContext);
