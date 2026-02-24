"use client";

import imageCompression from "browser-image-compression";
import React, { useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export type ImageUploadResult = {
  url: string;
  name: string;
  path: string;
};

export type ImageUploadProps = {
  /** Storage bucket name (e.g., 'tours-gallery', 'news-images') */
  bucket: string;
  /** Path prefix for files (e.g., tour.id, 'news') */
  pathPrefix: string;
  /** Current uploaded image URLs */
  value?: string[];
  /** Called when images are uploaded */
  onChange: (urls: string[]) => void;
  /** Allow multiple images (for gallery) */
  multiple?: boolean;
  /** Height of upload area */
  height?: number;
  /** Show upload button text */
  uploadText?: string;
  /** Show remove button */
  showRemove?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Accept file types */
  accept?: string;
  /** Custom className for container */
  className?: string;
};

const DEFAULT_COMPRESSION_OPTIONS = {
  maxWidthOrHeight: 1920,
  maxSizeMB: 1.0,
  initialQuality: 0.92,
  useWebWorker: true,
  fileType: "image/webp" as const,
};

export function ImageUpload({
  bucket,
  pathPrefix,
  value = [],
  onChange,
  multiple = false,
  height = 128,
  uploadText = "Klikk for å laste opp bilde",
  showRemove = true,
  disabled = false,
  accept = "image/jpeg,image/png,image/webp",
  className = "",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const supabase = getSupabaseBrowserClient();

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const baseTime = Date.now();
      const newUrls: string[] = [];

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        let toUpload: File;
        const baseName = file.name.replace(/\.[^.]+$/, "") || "image";

        try {
          const compressed = await imageCompression(
            file,
            DEFAULT_COMPRESSION_OPTIONS,
          );
          toUpload =
            compressed instanceof File
              ? compressed
              : new File([compressed], `${baseName}.webp`, {
                  type: "image/webp",
                });
        } catch {
          try {
            const fallback = await imageCompression(file, {
              maxWidthOrHeight: 1920,
              maxSizeMB: 1.0,
              initialQuality: 0.92,
              useWebWorker: true,
            });
            toUpload =
              fallback instanceof File
                ? fallback
                : new File([fallback], file.name, { type: file.type });
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "Komprimering feilet";
            toast({
              variant: "destructive",
              title: "Bildeopplasting feilet",
              description: msg,
            });
            continue;
          }
        }

        const ext = toUpload.name.endsWith(".webp")
          ? ".webp"
          : (file.name.match(/\.[^.]+$/)?.[0] ?? ".jpg");
        const sanitized = (baseName + ext).replace(/[^a-zA-Z0-9._-]/g, "-");
        const filePath = `${pathPrefix}/${baseTime}-${index}-${sanitized}`;

        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, toUpload, {
            contentType: toUpload.type,
            upsert: true,
          });

        if (error) {
          toast({
            variant: "destructive",
            title: "Bildeopplasting feilet",
            description: error.message,
          });
          continue;
        }

        const { data: publicData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        newUrls.push(publicData.publicUrl);
      }

      if (newUrls.length > 0) {
        const updatedUrls = multiple ? [...value, ...newUrls] : newUrls;
        onChange(updatedUrls);

        toast({
          title: "Bilder lastet opp",
          description: `${newUrls.length} bilde(r) lastet opp.`,
        });
      }
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const hasImages = value.length > 0;
  const showUploadButton = multiple || !hasImages;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Existing images */}
      {hasImages && (
        <div
          className={`grid gap-3 ${
            multiple
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {value.map((url, index) => (
            <div key={url} className="group relative">
              <div
                className={`relative overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900/70 ${
                  multiple ? "h-24 w-full" : "h-32 w-full"
                }`}
              >
                <Image
                  src={url}
                  alt={`Opplastet bilde ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {showRemove && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveImage(index)}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Fjern
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {showUploadButton && (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={handleImageUpload}
            disabled={disabled || isUploading}
          />
          <Button
            type="button"
            variant="outline"
            className={`w-full flex-col gap-2 border-dashed border-neutral-600 bg-neutral-900/70 hover:border-neutral-500 hover:bg-neutral-800/70 ${
              multiple ? "h-24" : `h-${height / 4}`
            }`}
            style={{ height: `${height}px` }}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <>
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-neutral-200" />
                <span className="text-sm">Laster opp...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-neutral-400" />
                <span className="text-sm text-neutral-400">{uploadText}</span>
                <span className="text-xs text-neutral-500">
                  JPEG, PNG, Webp (maks 1MB)
                </span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
