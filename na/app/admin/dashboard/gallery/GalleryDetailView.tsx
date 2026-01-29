"use client";

import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ImageIcon, Plus, Trash2 } from "lucide-react";
import type { FileObject } from "@supabase/storage-js";
import type { Tour } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "../utils/ConfirmDialog";

type GalleryDetailViewProps = {
  tour: Tour;
  onBack: () => void;
};

export function GalleryDetailView({ tour, onBack }: GalleryDetailViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [images, setImages] = useState<Array<{ name: string; url: string }>>(
    [],
  );
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [deletingImageName, setDeletingImageName] = useState<string | null>(
    null,
  );
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  type UploadResult = { data: unknown; error: { message?: string } | null };

  const loadImages = useCallback(async () => {
    setIsLoadingImages(true);
    const { data, error } = await supabase.storage
      .from("tours-gallery")
      .list(`${tour.id}/`, {
        limit: 200,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Kunne ikke hente bilder",
        description: error.message,
      });
      setIsLoadingImages(false);
      return;
    }

    const mapped = (data ?? [])
      .filter((file: FileObject) => file.name && !file.name.endsWith("/"))
      .map((file: FileObject) => {
        const { data: publicData } = supabase.storage
          .from("tours-gallery")
          .getPublicUrl(`${tour.id}/${file.name}`);
        return { name: file.name, url: publicData.publicUrl };
      });

    setImages(mapped);
    setIsLoadingImages(false);
  }, [supabase, toast, tour.id]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteImage = async (imageName: string) => {
    setDeletingImageName(imageName);
    const path = `${tour.id}/${imageName}`;
    const { error } = await supabase.storage
      .from("tours-gallery")
      .remove([path]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Kunne ikke slette bildet",
        description: error.message,
      });
    } else {
      toast({ title: "Bilde slettet" });
      await loadImages();
    }
    setDeletingImageName(null);
    setImageToDelete(null);
  };

  const onConfirmDelete = () => {
    if (imageToDelete) handleDeleteImage(imageToDelete);
  };

  const handleFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(null);
    try {
      const total = files.length;
      const baseTime = Date.now();
      const compressionOptions = {
        maxWidthOrHeight: 1920,
        maxSizeMB: 0.4,
        initialQuality: 0.8,
        useWebWorker: true,
        fileType: "image/webp" as const,
      };

      const results: UploadResult[] = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setUploadProgress(
          `Komprimerer og laster opp bilde ${index + 1} av ${total}…`,
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
          try {
            const fallback = await imageCompression(file, {
              maxWidthOrHeight: 1920,
              maxSizeMB: 0.5,
              initialQuality: 0.8,
              useWebWorker: true,
            });
            toUpload =
              fallback instanceof File
                ? fallback
                : new File([fallback], file.name, { type: file.type });
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "Komprimering feilet";
            results.push({ data: null, error: { message: msg } });
            continue;
          }
        }
        const ext = toUpload.name.endsWith(".webp")
          ? ".webp"
          : (file.name.match(/\.[^.]+$/)?.[0] ?? ".jpg");
        const sanitized = (baseName + ext).replace(/[^a-zA-Z0-9._-]/g, "-");
        const filePath = `${tour.id}/${baseTime}-${index}-${sanitized}`;
        const result = (await supabase.storage
          .from("tours-gallery")
          .upload(filePath, toUpload, {
            contentType: toUpload.type,
            upsert: true,
          })) as UploadResult;
        results.push(result);
      }
      const failures = results.filter((r) => r.error);

      const errorMessage = (err: { message?: string } | null): string =>
        err?.message ?? "Ukjent feil";

      if (failures.length > 0) {
        toast({
          variant: "destructive",
          title: "Opplasting feilet",
          description: `Kunne ikke laste opp ${failures.length} bilde(r). ${errorMessage(failures[0]?.error ?? null)}`,
        });
      } else {
        toast({
          title: "Bilder lastet opp",
          description: `${files.length} bilde(r) lastet opp.`,
        });
        await loadImages();
      }
    } finally {
      setUploadProgress(null);
      setIsUploading(false);
      event.target.value = "";
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadImages();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadImages]);

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
          <span>Tilbake til turer</span>
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
      {uploadProgress ? (
        <p
          className="text-sm text-neutral-400"
          role="status"
          aria-live="polite"
        >
          {uploadProgress}
        </p>
      ) : null}

      <Card className="bg-card border-primary/20 rounded-[18px] border">
        <CardContent className="space-y-8 px-6 pt-4 pb-8">
          <div className="space-y-2">
            <CardTitle className="text-xl text-neutral-50">
              {tour.title} - Bilder
            </CardTitle>
            <p className="text-sm text-neutral-400">
              Administrer bilder sortert etter tur
            </p>
          </div>

          {images.length === 0 ? (
            <div className="rounded-[18px] border border-neutral-800 bg-neutral-900/40 px-6 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700/80 bg-neutral-800/70 text-neutral-300">
                <ImageIcon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-semibold text-neutral-50">
                Ingen bilder enda
              </h3>
              <p className="mt-2 text-sm text-neutral-400">
                Dra og slipp bilder her, eller klikk for å laste opp
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
            <div className="h-112 min-h-0 overflow-x-hidden overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={image.name}
                    className="rounded-[18px] border border-neutral-800 bg-neutral-900/50 p-2"
                  >
                    <div className="relative aspect-4/3 w-full overflow-hidden rounded-[14px] bg-neutral-900">
                      <Image
                        src={image.url}
                        alt={image.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                      />
                      <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
                        <span className="rounded-md bg-black/60 px-2 py-0.5 text-xs text-neutral-200">
                          #{index + 1}
                        </span>
                        <Button
                          type="button"
                          size="icon-sm"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 w-7 rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageToDelete(image.name);
                          }}
                          disabled={deletingImageName === image.name}
                          aria-label={`Slett ${image.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {isLoadingImages ? (
            <p className="text-xs text-neutral-400">Laster bilder...</p>
          ) : null}
        </CardContent>
      </Card>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />
      <ConfirmDialog
        open={imageToDelete !== null}
        title="Slett bilde?"
        description="Er du sikker på at du vil slette dette bildet? Handlingen kan ikke angres."
        onClose={() => setImageToDelete(null)}
        onConfirm={onConfirmDelete}
        confirmLabel="Slett"
        cancelLabel="Avbryt"
        isConfirming={deletingImageName === imageToDelete}
      />
    </section>
  );
}
