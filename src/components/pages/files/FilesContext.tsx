import { FileItem } from "@/types/files";
import { createContext, useContext } from "react";

type FilesContextType = {
  files: FileItem[];
};

export const FilesContext = createContext<FilesContextType>({
  files: [],
});

export const useFilesContext = () => useContext(FilesContext);
