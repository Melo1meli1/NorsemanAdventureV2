"use client";

import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createNewsSchema,
  updateNewsSchema,
  type CreateNewsInput,
  type UpdateNewsInput,
} from "@/lib/zod/newsValidation";
import { createNews, updateNews } from "../actions/news";
import type { News } from "@/lib/types/news";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/common/ImageUpload";

const accentOrange = "#ef5b25";

const inputClassName =
  "h-11 rounded-lg border-neutral-700 bg-neutral-900/70 text-neutral-50 placeholder:text-neutral-500";

type Mode = "create" | "edit";

type NewsFormValues = Omit<CreateNewsInput, "published_at"> & {
  id?: string;
  published_at: string;
};

type NewsFormProps = {
  mode: Mode;
  initialNews?: News | null;
  onClose: () => void;
  onSuccess?: () => void;
};

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

export default function NewsForm({
  mode,
  initialNews,
  onClose,
  onSuccess,
}: NewsFormProps) {
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setError,
    setValue,
    control,
  } = useForm<NewsFormValues, object, CreateNewsInput | UpdateNewsInput>({
    mode: "onChange",
    resolver: zodResolver(
      (isEdit ? updateNewsSchema : createNewsSchema) as typeof createNewsSchema,
    ) as unknown as Resolver<
      NewsFormValues,
      object,
      CreateNewsInput | UpdateNewsInput
    >,
    defaultValues:
      isEdit && initialNews
        ? {
            id: initialNews.id,
            title: initialNews.title,
            short_description: initialNews.short_description ?? "",
            content: initialNews.content ?? "",
            image_url: initialNews.image_url ?? "",
            status: initialNews.status,
            published_at: toDateInputValue(initialNews.published_at),
          }
        : {
            status: "draft",
            published_at: "",
          },
  });

  const statusValue = useWatch({
    control,
    name: "status",
    defaultValue: "draft",
  });

  const handleImageChange = (urls: string[]) => {
    setValue("image_url", urls[0] || "");
  };

  async function onSubmit(data: CreateNewsInput | UpdateNewsInput) {
    const formData = new FormData();
    formData.set("title", data.title ?? "");
    formData.set("short_description", data.short_description ?? "");
    formData.set("content", data.content ?? "");
    formData.set("image_url", data.image_url ?? "");
    formData.set("status", data.status ?? "draft");
    formData.set(
      "published_at",
      data.published_at instanceof Date
        ? data.published_at.toISOString().slice(0, 10)
        : String(data.published_at ?? ""),
    );

    if (isEdit && "id" in data && data.id) {
      formData.set("id", data.id);
    }

    const result = isEdit
      ? await updateNews(formData)
      : await createNews(formData);

    if (result?.success) {
      onSuccess?.();
      onClose();
      return;
    }

    if (result?.error) {
      setError("root", { message: result.error });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 text-left"
      noValidate
    >
      {errors.root && (
        <div
          role="alert"
          className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200"
        >
          {errors.root.message}
        </div>
      )}

      {/* Tittel */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-neutral-200">
          Tittel *
        </label>
        <Input
          id="title"
          type="text"
          placeholder="F.eks. Sesongåpning 2026"
          className={inputClassName}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-red-400">{errors.title.message}</p>
        )}
      </div>

      {/* Kort beskrivelse */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="short_description"
          className="text-sm font-medium text-neutral-200"
        >
          Kort beskrivelse
        </label>
        <textarea
          id="short_description"
          rows={2}
          placeholder="En kort oppsummering av nyheten"
          className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-50 placeholder:text-neutral-500 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) focus:outline-none"
          style={{ "--accent": accentOrange } as React.CSSProperties}
          {...register("short_description")}
        />
        {errors.short_description && (
          <p className="text-xs text-red-400">
            {errors.short_description.message}
          </p>
        )}
      </div>

      {/* Innhold */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="content"
          className="text-sm font-medium text-neutral-200"
        >
          Innhold
        </label>
        <textarea
          id="content"
          rows={6}
          placeholder="Skriv hele nyhetsartikkelen her..."
          className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-50 placeholder:text-neutral-500 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) focus:outline-none"
          style={{ "--accent": accentOrange } as React.CSSProperties}
          {...register("content")}
        />
        {errors.content && (
          <p className="text-xs text-red-400">{errors.content.message}</p>
        )}
      </div>

      {/* Bildeopplasting og Publiseringsdato – 2-kolonne grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-200">Bilde</label>

          <ImageUpload
            bucket="news-images"
            pathPrefix="news"
            value={initialNews?.image_url ? [initialNews.image_url] : []}
            onChange={handleImageChange}
            multiple={false}
            height={128}
            uploadText="Klikk for å laste opp bilde"
          />

          <input type="hidden" {...register("image_url")} />
          {errors.image_url && (
            <p className="text-xs text-red-400">{errors.image_url.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="published_at"
            className="text-sm font-medium text-neutral-200"
          >
            Publiseringsdato
          </label>
          <Input
            id="published_at"
            type="date"
            className={`tour-date-input ${inputClassName} text-base`}
            {...register("published_at")}
          />
          {errors.published_at && (
            <p className="text-xs text-red-400">
              {errors.published_at.message}
            </p>
          )}
        </div>
      </div>

      {/* Status toggle */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-neutral-700 bg-neutral-900/70 px-4 py-3">
        <span className="text-sm font-medium text-neutral-200">
          Nyhet er publisert og synlig på nettsiden
        </span>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={statusValue === "published"}
            onChange={(e) =>
              setValue("status", e.target.checked ? "published" : "draft")
            }
          />
          <div className="peer h-6 w-11 rounded-full bg-neutral-700 peer-checked:bg-[#ef5b25] peer-focus:ring-2 peer-focus:ring-[#ef5b25]/50 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-600 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
        </label>
      </div>

      {/* Skjult id i edit */}
      {isEdit && initialNews && <input type="hidden" {...register("id")} />}

      {/* Knapper */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 font-semibold uppercase"
          onClick={onClose}
        >
          Avbryt
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="flex-1 font-semibold uppercase"
        >
          {isSubmitting
            ? "Lagrer…"
            : isEdit
              ? "Lagre endringer"
              : "Opprett nyhet"}
        </Button>
      </div>
    </form>
  );
}
