"use client";

import { useDropzone, DropzoneOptions } from "react-dropzone";
import { cn } from "@/lib/utils";
import { UploadCloud } from "lucide-react";

interface FileDropZoneProps extends Partial<DropzoneOptions> {
  children: React.ReactNode;
  className?: string;
}

export function FileDropZone({
  children,
  className,
  ...props
}: FileDropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true, // Preserve existing upload buttons
    multiple: true,
    ...props,
  } as DropzoneOptions);

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative h-full transition-all duration-200 ease-in-out",
        isDragActive
          ? "bg-primary/5 ring-primary rounded-lg ring-2 ring-inset"
          : "",
        className,
      )}
    >
      <input {...getInputProps()} className="hidden" />

      {/* Overlay showing "Slipp filene her" when dragging */}
      {isDragActive && (
        <div className="bg-background/80 absolute inset-0 z-50 flex items-center justify-center rounded-lg backdrop-blur-sm">
          <div className="text-primary flex animate-bounce flex-col items-center gap-2">
            <UploadCloud className="h-10 w-10" />
            <p className="text-lg font-bold">Slipp bildene for å laste opp</p>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
