"use client";

import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTourSchema,
  type CreateTourInput,
} from "@/lib/zod/tourValidation";

import {
  updateTourSchema,
  type UpdateTourInput,
} from "@/lib/zod/tourValidation";
import { createTour, updateTour } from "../actions/tours";
import type { Tour } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const accentOrange = "#ef5b25";

const inputClassName =
  "h-11 rounded-lg border-neutral-700 bg-neutral-900/70 text-neutral-50 placeholder:text-neutral-500";

type Mode = "create" | "edit";

/** Form state uses string dates (HTML date inputs); zod coerces to Date on submit.
 *  Enum fields use "" for empty select; zod transforms to null on submit. */
type TourFormValues = Omit<
  CreateTourInput,
  "start_date" | "end_date" | "vanskelighetsgrad" | "sesong" | "terreng"
> & {
  start_date: string;
  end_date: string;
  id?: string;
  vanskelighetsgrad?: string;
  sesong?: string;
  terreng?: string;
};

type TourFormProps = {
  mode: Mode;
  initialTour?: Tour | null;
  onClose: () => void;
  onSuccess?: () => void;
};

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

export default function TourForm({
  mode,
  initialTour,
  onClose,
  onSuccess,
}: TourFormProps) {
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setError,
    setValue,
    control,
  } = useForm<TourFormValues, object, CreateTourInput | UpdateTourInput>({
    mode: "onChange",
    resolver: zodResolver(
      (isEdit ? updateTourSchema : createTourSchema) as typeof createTourSchema,
    ) as unknown as Resolver<
      TourFormValues,
      object,
      CreateTourInput | UpdateTourInput
    >,
    defaultValues:
      isEdit && initialTour
        ? {
            id: initialTour.id,
            title: initialTour.title,
            short_description: initialTour.short_description ?? "",
            long_description: initialTour.long_description ?? "",
            hoydepunkter: initialTour.hoydepunkter ?? "",
            sted: initialTour.sted ?? "",
            vanskelighetsgrad: initialTour.vanskelighetsgrad ?? "",
            sesong: initialTour.sesong ?? "",
            terreng: initialTour.terreng ?? "",
            price: initialTour.price,
            start_date: toDateInputValue(initialTour.start_date),
            end_date: toDateInputValue(initialTour.end_date),
            seats_available: initialTour.seats_available,
            total_seats:
              (initialTour as { total_seats?: number }).total_seats ??
              initialTour.seats_available,
            status: initialTour.status,
          }
        : {
            status: "draft",
            seats_available: 10,
            total_seats: 10,
          },
  });

  const statusValue = useWatch({
    control,
    name: "status",
    defaultValue: "draft",
  });

  const startDateStr = useWatch({
    control,
    name: "start_date",
    defaultValue: "",
  });
  const endDateStr = useWatch({ control, name: "end_date", defaultValue: "" });

  const durationText = (() => {
    if (!startDateStr || !endDateStr) {
      return "Velg start- og sluttdato";
    }
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "Velg start- og sluttdato";
    }
    if (end < start) {
      return "Ugyldig varighet (sluttdato før startdato)";
    }
    const days = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days === 1 ? "1 dag" : `${days} dager`;
  })();

  async function onSubmit(data: CreateTourInput | UpdateTourInput) {
    const formData = new FormData();
    formData.set("title", data.title ?? "");
    formData.set("short_description", data.short_description ?? "");
    formData.set("long_description", data.long_description ?? "");
    formData.set("hoydepunkter", data.hoydepunkter ?? "");
    formData.set("sted", data.sted ?? "");
    formData.set("vanskelighetsgrad", data.vanskelighetsgrad ?? "");
    formData.set("sesong", data.sesong ?? "");
    formData.set("terreng", data.terreng ?? "");
    formData.set("price", String(data.price ?? 0));
    formData.set(
      "start_date",
      data.start_date instanceof Date
        ? data.start_date.toISOString().slice(0, 10)
        : String(data.start_date ?? ""),
    );
    formData.set(
      "end_date",
      data.end_date instanceof Date
        ? data.end_date.toISOString().slice(0, 10)
        : String(data.end_date ?? ""),
    );
    formData.set("seats_available", String(data.seats_available ?? 0));
    formData.set("total_seats", String(data.total_seats ?? 0));
    formData.set("image_url", isEdit ? (initialTour?.image_url ?? "") : "");
    formData.set("status", data.status ?? "draft");

    if (isEdit && "id" in data && data.id) {
      formData.set("id", data.id);
    }

    const result = isEdit
      ? await updateTour(formData)
      : await createTour(formData);

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
          placeholder="F.eks. Nordkapp Ekspedisjon"
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
          Kort beskrivelse *
        </label>
        <textarea
          id="short_description"
          rows={2}
          placeholder="En kort og fengende beskrivelse av turen"
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

      {/* Lang beskrivelse */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="long_description"
          className="text-sm font-medium text-neutral-200"
        >
          Lang beskrivelse
        </label>
        <textarea
          id="long_description"
          rows={5}
          placeholder="Utfyllende beskrivelse av turen, program, inkludert osv."
          className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-50 placeholder:text-neutral-500 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) focus:outline-none"
          style={{ "--accent": accentOrange } as React.CSSProperties}
          {...register("long_description")}
        />
        {errors.long_description && (
          <p className="text-xs text-red-400">
            {errors.long_description.message}
          </p>
        )}
      </div>

      {/* Sted, vanskelighetsgrad, sesong, terreng – 2x2 grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="sted"
            className="text-sm font-medium text-neutral-200"
          >
            Sted *
          </label>
          <Input
            id="sted"
            type="text"
            placeholder="F.eks. Lofoten, Nordkapp"
            className={inputClassName}
            {...register("sted")}
          />
          {errors.sted && (
            <p className="text-xs text-red-400">{errors.sted.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="vanskelighetsgrad"
            className="text-sm font-medium text-neutral-200"
          >
            Vanskelighetsgrad
          </label>
          <select
            id="vanskelighetsgrad"
            className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 text-sm text-neutral-50 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) focus:outline-none"
            style={{ "--accent": accentOrange } as React.CSSProperties}
            {...register("vanskelighetsgrad")}
          >
            <option value="">Velg</option>
            <option value="nybegynner">Nybegynner</option>
            <option value="intermediær">Intermediær</option>
            <option value="erfaren">Erfaren</option>
            <option value="ekspert">Ekspert</option>
          </select>
          {errors.vanskelighetsgrad && (
            <p className="text-xs text-red-400">
              {errors.vanskelighetsgrad.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="sesong"
            className="text-sm font-medium text-neutral-200"
          >
            Sesong
          </label>
          <select
            id="sesong"
            className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 text-sm text-neutral-50 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) focus:outline-none"
            style={{ "--accent": accentOrange } as React.CSSProperties}
            {...register("sesong")}
          >
            <option value="">Velg</option>
            <option value="sommer">Sommer</option>
            <option value="vinter">Vinter</option>
          </select>
          {errors.sesong && (
            <p className="text-xs text-red-400">{errors.sesong.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="terreng"
            className="text-sm font-medium text-neutral-200"
          >
            Terreng
          </label>
          <select
            id="terreng"
            className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 text-sm text-neutral-50 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) focus:outline-none"
            style={{ "--accent": accentOrange } as React.CSSProperties}
            {...register("terreng")}
          >
            <option value="">Velg</option>
            <option value="asfalt">Asfalt</option>
            <option value="grus">Grus</option>
            <option value="blandet">Blandet</option>
          </select>
          {errors.terreng && (
            <p className="text-xs text-red-400">{errors.terreng.message}</p>
          )}
        </div>
      </div>

      {/* Pris + Plasser */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="price"
            className="text-sm font-medium text-neutral-200"
          >
            Pris (NOK) *
          </label>
          <Input
            id="price"
            type="number"
            min={0}
            step={1}
            placeholder="0"
            className={inputClassName}
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-xs text-red-400">{errors.price.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="total_seats"
            className="text-sm font-medium text-neutral-200"
          >
            Totalt antall plasser *
          </label>
          <Input
            id="total_seats"
            type="number"
            min={1}
            className={inputClassName}
            {...register("total_seats", { valueAsNumber: true })}
          />
          {errors.total_seats && (
            <p className="text-xs text-red-400">{errors.total_seats.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="seats_available"
            className="text-sm font-medium text-neutral-200"
          >
            Ledige plasser *
          </label>
          <Input
            id="seats_available"
            type="number"
            min={0}
            className={inputClassName}
            {...register("seats_available", { valueAsNumber: true })}
          />
          {errors.seats_available && (
            <p className="text-xs text-red-400">
              {errors.seats_available.message}
            </p>
          )}
        </div>
      </div>

      {/* Startdato + Sluttdato */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="start_date"
            className="text-sm font-medium text-neutral-200"
          >
            Startdato *
          </label>
          <Input
            id="start_date"
            type="date"
            className={`tour-date-input ${inputClassName} text-base`}
            {...register("start_date")}
          />
          {errors.start_date && (
            <p className="text-xs text-red-400">{errors.start_date.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="end_date"
            className="text-sm font-medium text-neutral-200"
          >
            Sluttdato *
          </label>
          <Input
            id="end_date"
            type="date"
            className={`tour-date-input ${inputClassName} text-base`}
            {...register("end_date")}
          />
          {errors.end_date && (
            <p className="text-xs text-red-400">{errors.end_date.message}</p>
          )}
        </div>
      </div>

      <p className="flex items-center gap-2 text-base text-neutral-400">
        <span aria-hidden>ⓘ</span>
        Varighet: <span className="font-medium text-white">{durationText}</span>
      </p>

      {/* Høydepunkter (kommaseparert) */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="hoydepunkter"
          className="text-sm font-medium text-neutral-200"
        >
          Høydepunkter (kommaseparert)
        </label>
        <Input
          id="hoydepunkter"
          type="text"
          placeholder="Nordkapp, Lofoten, Trollstigen"
          className={inputClassName}
          {...register("hoydepunkter")}
        />
        {errors.hoydepunkter && (
          <p className="text-xs text-red-400">{errors.hoydepunkter.message}</p>
        )}
      </div>

      {/* Status: Draft / Published (toggle) – bruk setValue slik at form state oppdateres */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-neutral-700 bg-neutral-900/70 px-4 py-3">
        <span className="text-sm font-medium text-neutral-200">
          Tur er aktiv og synlig på nettsiden
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
      {isEdit && initialTour && <input type="hidden" {...register("id")} />}

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
              : "Opprett tur"}
        </Button>
      </div>
    </form>
  );
}
