import { FileItem } from "@/types/files";
import { createContext, useContext } from "react";

type FilesContextType = {
  files: FileItem[];
  viewFile: FileItem | null;
  setViewFile: (file: FileItem | null) => void;
};

export const FilesContext = createContext<FilesContextType>({
  files: [],
  viewFile: null,
  setViewFile: () => null,
});

export const useFilesContext = () => useContext(FilesContext);
