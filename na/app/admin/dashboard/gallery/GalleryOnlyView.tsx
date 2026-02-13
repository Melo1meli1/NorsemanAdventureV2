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
  getAllPublicGalleryImages,
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
    Array<{
      id: string;
      file_path: string;
      url: string;
      tour_id: string | null;
      tour_title: string | null;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    file_path: string;
    tour_id: string | null;
  } | null>(null);
  const { toast } = useToast();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const loadImages = useCallback(async () => {
    setIsLoading(true);
    const res = await getAllPublicGalleryImages();
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
      return {
        id: row.id,
        file_path: row.file_path,
        url: urlData.publicUrl,
        tour_id: row.tour_id,
        tour_title: row.tour_title,
      };
    });
    setImages(withUrls);
    setIsLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleDelete = async (filePath: string, tourId: string | null) => {
    setDeletingPath(filePath);
    const isFromTour = tourId != null;
    if (!isFromTour) {
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
        setItemToDelete(null);
        return;
      }
    }
    const removeResult = await removeFromPublicGallery(filePath);
    if (removeResult.success) {
      setImages((prev) => prev.filter((img) => img.file_path !== filePath));
      toast(
        isFromTour
          ? {
              title:
                "Fjernet fra offentlig galleri (bildet ligger fortsatt under turen)",
            }
          : { title: "Bilde slettet" },
      );
    } else {
      toast({
        variant: "destructive",
        title: isFromTour
          ? "Kunne ikke fjerne fra offentlig galleri"
          : "Bilde fjernet fra lagring, men kunne ikke oppdatere galleri",
        description: removeResult.error,
      });
    }
    setDeletingPath(null);
    setItemToDelete(null);
  };

  const onConfirmDelete = () => {
    if (itemToDelete)
      handleDelete(itemToDelete.file_path, itemToDelete.tour_id);
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
            {
              id: "",
              file_path: filePath,
              url: urlData.publicUrl,
              tour_id: null,
              tour_title: null,
            },
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
              Offentlige bilder
            </CardTitle>
            <p className="text-sm text-neutral-400">
              Alt som vises her er sannhetskilden for den offentlige
              galleri-siden. Inkluderer bilder fra turer (når du har trykket
              globus) og bilder lastet opp uten tur.
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
                Ingen offentlige bilder
              </h3>
              <p className="mt-2 text-sm text-neutral-400">
                Legg bilder til fra en tur (globus-knappen) eller last opp her
                uten å knytte til tur.
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
                  key={img.id || img.file_path}
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
                    <div className="absolute top-2 left-2">
                      <span
                        className="rounded-md bg-black/60 px-2 py-1 text-xs text-neutral-200"
                        title={
                          img.tour_id
                            ? `Fra tur: ${img.tour_title ?? ""}`
                            : "Uten tur"
                        }
                      >
                        {img.tour_title ? `Fra: ${img.tour_title}` : "Uten tur"}
                      </span>
                    </div>
                    <div className="absolute right-2 bottom-2">
                      <Button
                        type="button"
                        size="icon-sm"
                        className="h-7 w-7 rounded-md bg-black/60 text-neutral-200 hover:bg-black/80"
                        onClick={() =>
                          setItemToDelete({
                            file_path: img.file_path,
                            tour_id: img.tour_id,
                          })
                        }
                        disabled={deletingPath === img.file_path}
                        aria-label={
                          img.tour_id
                            ? "Fjern fra offentlig galleri"
                            : `Slett ${img.file_path}`
                        }
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
        open={itemToDelete !== null}
        title={
          itemToDelete?.tour_id
            ? "Fjerne fra offentlig galleri?"
            : "Slett bilde?"
        }
        description={
          itemToDelete?.tour_id
            ? "Bildet fjernes fra den offentlige galleri-siden, men beholdes under turen i admin."
            : "Er du sikker på at du vil slette dette bildet? Handlingen kan ikke angres."
        }
        onClose={() => setItemToDelete(null)}
        onConfirm={onConfirmDelete}
        confirmLabel={itemToDelete?.tour_id ? "Fjern fra galleri" : "Slett"}
        cancelLabel="Avbryt"
        isConfirming={
          itemToDelete !== null && deletingPath === itemToDelete.file_path
        }
      />
    </section>
  );
}
