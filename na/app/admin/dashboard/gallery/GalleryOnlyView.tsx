"use client";

import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ImageIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";
import { useToast } from "@/hooks/use-toast";
import {
  getGalleryOnlyImages,
  addGalleryOnlyToPublicGallery,
  removeFromPublicGallery,
} from "../actions/gallery";
import { ConfirmDialog } from "../utils/ConfirmDialog";

const STORAGE_PREFIX = "_gallery";

type GalleryOnlyViewProps = {
  onBack: () => void;
};

export function GalleryOnlyView({ onBack }: GalleryOnlyViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [images, setImages] = useState<
    Array<{ id: string; file_path: string; url: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [pathToDelete, setPathToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const loadImages = useCallback(async () => {
    setIsLoading(true);
    const res = await getGalleryOnlyImages();
    if (!res.success) {
      toast({
        variant: "destructive",
        title: "Kunne ikke hente bilder",
        description: res.error,
      });
      setImages([]);
      setIsLoading(false);
      return;
    }
    const withUrls = res.data.map((row) => {
      const { data: urlData } = supabase.storage
        .from("tours-gallery")
        .getPublicUrl(row.file_path);
      return { ...row, url: urlData.publicUrl };
    });
    setImages(withUrls);
    setIsLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleDelete = async (filePath: string) => {
    setDeletingPath(filePath);
    const { error: storageError } = await supabase.storage
      .from("tours-gallery")
      .remove([filePath]);

    if (storageError) {
      toast({
        variant: "destructive",
        title: "Kunne ikke slette fil",
        description: storageError.message,
      });
      setDeletingPath(null);
      setPathToDelete(null);
      return;
    }

    const removeResult = await removeFromPublicGallery(filePath);
    if (removeResult.success) {
      setImages((prev) => prev.filter((img) => img.file_path !== filePath));
      toast({ title: "Bilde slettet" });
    } else {
      toast({
        variant: "destructive",
        title: "Bilde fjernet fra lagring, men kunne ikke oppdatere galleri",
        description: removeResult.error,
      });
    }
    setDeletingPath(null);
    setPathToDelete(null);
  };

  const onConfirmDelete = () => {
    if (pathToDelete) handleDelete(pathToDelete);
  };

  const handleFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(null);
    const baseTime = Date.now();
    const compressionOptions = {
      maxWidthOrHeight: 1920,
      maxSizeMB: 1.0,
      initialQuality: 0.92,
      useWebWorker: true,
      fileType: "image/webp" as const,
    };

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setUploadProgress(
          `Komprimerer og laster opp ${index + 1} av ${files.length}…`,
        );
        let toUpload: File;
        const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
        try {
          const compressed = await imageCompression(file, compressionOptions);
          toUpload =
            compressed instanceof File
              ? compressed
              : new File([compressed], `${baseName}.webp`, {
                  type: "image/webp",
                });
        } catch {
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
        }
        const ext = toUpload.name.endsWith(".webp")
          ? ".webp"
          : (file.name.match(/\.[^.]+$/)?.[0] ?? ".jpg");
        const sanitized = (baseName + ext).replace(/[^a-zA-Z0-9._-]/g, "-");
        const fileName = `${baseTime}-${index}-${sanitized}`;
        const filePath = `${STORAGE_PREFIX}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("tours-gallery")
          .upload(filePath, toUpload, {
            contentType: toUpload.type,
            upsert: true,
          });

        if (uploadError) {
          toast({
            variant: "destructive",
            title: "Opplasting feilet",
            description: uploadError.message,
          });
          continue;
        }

        const insertResult = await addGalleryOnlyToPublicGallery(filePath);
        if (insertResult.success) {
          const { data: urlData } = supabase.storage
            .from("tours-gallery")
            .getPublicUrl(filePath);
          setImages((prev) => [
            { id: "", file_path: filePath, url: urlData.publicUrl },
            ...prev,
          ]);
        } else {
          toast({
            variant: "destructive",
            title: "Bilde lastet opp, men kunne ikke legge til i galleri",
            description: insertResult.error,
          });
        }
      }
      if (files.length > 0) {
        toast({ title: "Bilder lastet opp til offentlig galleri" });
        await loadImages();
      }
    } finally {
      setUploadProgress(null);
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-neutral-300 hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span>Tilbake</span>
        </Button>
        <Button
          type="button"
          className="bg-primary text-primary-foreground"
          onClick={openFilePicker}
          disabled={isUploading}
        >
          <Plus className="h-4 w-4" aria-hidden />
          <span>{isUploading ? "Laster opp..." : "Last opp bilder"}</span>
        </Button>
      </div>
      {uploadProgress && (
        <p
          className="text-sm text-neutral-400"
          role="status"
          aria-live="polite"
        >
          {uploadProgress}
        </p>
      )}

      <Card className="bg-card border-primary/20 rounded-[18px] border">
        <CardContent className="space-y-6 px-6 pt-4 pb-8">
          <div className="space-y-2">
            <CardTitle className="text-xl text-neutral-50">
              Offentlige bilder (uten tur)
            </CardTitle>
            <p className="text-sm text-neutral-400">
              Bilder du laster opp her vises kun i offentlig galleri under «alle
              bilder», ikke ved filtrering på tur.
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-neutral-400">Laster bilder...</p>
          ) : images.length === 0 ? (
            <div className="rounded-[18px] border border-neutral-800 bg-neutral-900/40 px-6 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700/80 bg-neutral-800/70 text-neutral-300">
                <ImageIcon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-semibold text-neutral-50">
                Ingen offentlige bilder (uten tur)
              </h3>
              <p className="mt-2 text-sm text-neutral-400">
                Last opp bilder som skal vises i offentlig galleri uten å
                knyttes til en tur.
              </p>
              <Button
                type="button"
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary/10 mt-5"
                onClick={openFilePicker}
                disabled={isUploading}
              >
                Velg filer
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {images.map((img) => (
                <div
                  key={img.file_path}
                  className="rounded-[18px] border border-neutral-800 bg-neutral-900/50 p-2"
                >
                  <div className="relative aspect-4/3 w-full overflow-hidden rounded-[14px] bg-neutral-900">
                    <Image
                      src={img.url}
                      alt={img.file_path}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw, 25vw"
                      className="object-cover"
                    />
                    <div className="absolute right-2 bottom-2">
                      <Button
                        type="button"
                        size="icon-sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 w-7 rounded-md"
                        onClick={() => setPathToDelete(img.file_path)}
                        disabled={deletingPath === img.file_path}
                        aria-label={`Slett ${img.file_path}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      <ConfirmDialog
        open={pathToDelete !== null}
        title="Slett bilde?"
        description="Er du sikker på at du vil slette dette bildet fra offentlig galleri? Handlingen kan ikke angres."
        onClose={() => setPathToDelete(null)}
        onConfirm={onConfirmDelete}
        confirmLabel="Slett"
        cancelLabel="Avbryt"
        isConfirming={deletingPath === pathToDelete}
      />
    </section>
  );
}
