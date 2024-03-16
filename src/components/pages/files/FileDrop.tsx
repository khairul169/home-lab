// @ts-ignore
import { cn } from "@/lib/utils";
import Box from "@ui/Box";
import { Ionicons } from "@ui/Icons";
import Text from "@ui/Text";
import React, { useRef, useState } from "react";
import { Platform } from "react-native";

type Props = {
  children: React.ReactNode;
  isDisabled?: boolean;
  onFileDrop?: (files: File[]) => void;
  onDrop?: React.DragEventHandler<HTMLDivElement>;
  onDragOver?: React.DragEventHandler<HTMLDivElement>;
  onDragLeave?: React.DragEventHandler<HTMLDivElement>;
  className?: string;
};
const isWeb = Platform.OS === "web";

const FileDrop = ({ className, children, isDisabled, ...props }: Props) => {
  const dragContainerRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const [isDragging, setDragging] = useState(false);

  if (!isWeb) {
    return children;
  }

  return (
    <div
      style={cn("flex-1 relative flex overflow-hidden")}
      ref={dragContainerRef}
      onDrop={(e) => {
        e.preventDefault();
        if (!isDragging || isDisabled) {
          return;
        }

        setDragging(false);
        props.onDrop && props.onDrop(e);

        if (props.onFileDrop) {
          const files = Array.from(e.dataTransfer.items)
            .filter((i) => i.kind === "file")
            .map((i) => i.getAsFile());
          props.onFileDrop(files);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (isDragging || isDisabled) {
          return;
        }

        // ignore if not a file
        if (
          !e.dataTransfer.items ||
          !e.dataTransfer.items.length ||
          e.dataTransfer.items[0].kind !== "file"
        ) {
          return;
        }

        setDragging(true);
        props.onDragOver && props.onDragOver(e);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (!isDragging || e.target !== overlayRef.current) {
          return;
        }

        setDragging(false);
        props.onDragLeave && props.onDragLeave(e);
      }}
    >
      {children}

      {isDragging && (
        <Box
          ref={overlayRef}
          className="flex flex-col items-center justify-center absolute top-0 left-0 w-full h-full bg-black/10 z-10"
        >
          <Box
            className="bg-white p-8 rounded-xl flex flex-col items-center gap-2"
            style={{ pointerEvents: "none" }}
          >
            <Ionicons name="cloud-upload" style={{ fontSize: 48 }} />
            <Text className="text-primary">Drop files here</Text>
          </Box>
        </Box>
      )}
    </div>
  );
};

export default React.memo(FileDrop);
