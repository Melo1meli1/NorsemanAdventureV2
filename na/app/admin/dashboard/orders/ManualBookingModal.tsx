"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminBookingFormSchema,
  BOOKING_STATUS_LABELS,
  BOOKING_TYPE_LABELS,
  type AdminBookingFormValues,
} from "@/lib/zod/bookingValidation";
import { getTours } from "../actions/tours";
import type { BookingStatus, BookingType } from "@/lib/types";

type TourOption = { id: string; title: string; price: number };

export type ManualBookingInitialData = {
  id: string;
} & AdminBookingFormValues;

type ManualBookingModalProps = {
  open: boolean;
  onClose: () => void;
  /** Ved redigering: forhåndsutfylte verdier + booking-id */
  initialData?: ManualBookingInitialData | null;
  /** (data, editId) – editId satt ved redigering */
  onSubmit?: (
    data: AdminBookingFormValues,
    editId?: string,
  ) => void | Promise<void>;
};

const defaultParticipant = {
  name: "",
  email: "",
  telefon: "",
  sos_navn: "",
  sos_telefon: "",
};

function isParticipantFilled(p: typeof defaultParticipant) {
  return [p.name, p.email, p.telefon, p.sos_navn, p.sos_telefon].every(
    (s) => typeof s === "string" && s.trim() !== "",
  );
}

const emptyDefaultValues: AdminBookingFormValues = {
  type: "tur",
  tour_id: null,
  navn: "",
  epost: "",
  telefon: "",
  dato: new Date(),
  status: "ikke_betalt",
  belop: 0,
  betalt_belop: null,
  notater: null,
  participants: [{ ...defaultParticipant }],
};

function toFormValues(data: ManualBookingInitialData): AdminBookingFormValues {
  const dato =
    data.dato instanceof Date ? data.dato : new Date(data.dato as string);
  return {
    type: data.type ?? "tur",
    tour_id: data.tour_id ?? null,
    navn: data.navn ?? "",
    epost: data.epost ?? "",
    telefon: data.telefon ?? "",
    dato: Number.isNaN(dato.getTime()) ? new Date() : dato,
    status: data.status ?? "ikke_betalt",
    belop: data.belop ?? 0,
    betalt_belop: data.betalt_belop ?? null,
    notater: data.notater ?? null,
    participants:
      data.participants && data.participants.length > 0
        ? data.participants.map((p) => ({
            name: p.name ?? "",
            email: p.email ?? "",
            telefon: p.telefon ?? "",
            sos_navn: p.sos_navn ?? "",
            sos_telefon: p.sos_telefon ?? "",
          }))
        : [{ ...defaultParticipant }],
  };
}

export function ManualBookingModal({
  open,
  onClose,
  initialData,
  onSubmit: onSubmitProp,
}: ManualBookingModalProps) {
  const [tours, setTours] = useState<TourOption[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const prevOpenRef = useRef(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminBookingFormValues>({
    resolver: zodResolver(
      adminBookingFormSchema,
    ) as import("react-hook-form").Resolver<AdminBookingFormValues>,
    defaultValues: emptyDefaultValues,
  });

  const type = useWatch({ control, name: "type", defaultValue: "tur" });
  const tourId = useWatch({ control, name: "tour_id", defaultValue: null });
  const status = useWatch({
    control,
    name: "status",
    defaultValue: "ikke_betalt",
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "participants",
  });

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setSubmitError(null), 0);
    getTours().then((r) => {
      if (r.success && r.data) {
        setTours(
          r.data.map((t) => ({ id: t.id, title: t.title, price: t.price })),
        );
      }
    });
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    prevOpenRef.current = open;
    if (!open) return;
    if (justOpened) {
      if (initialData) reset(toFormValues(initialData));
      else reset(emptyDefaultValues);
    }
  }, [open, reset]);

  useEffect(() => {
    if (type !== "tur") {
      setValue("tour_id", null);
      setValue("belop", 0);
      return;
    }
    const tour = tours.find((t) => t.id === tourId);
    if (tour) setValue("belop", tour.price);
  }, [type, tourId, tours, setValue]);

  useEffect(() => {
    if (status !== "delvis_betalt") setValue("betalt_belop", null);
  }, [status, setValue]);

  const onSubmit = async (data: AdminBookingFormValues) => {
    setSubmitError(null);
    const participants = (data.participants ?? []).filter(isParticipantFilled);
    const payload: AdminBookingFormValues = {
      ...data,
      dato: data.dato instanceof Date ? data.dato : new Date(data.dato),
      participants: participants.length > 0 ? participants : undefined,
    };
    if (!onSubmitProp) {
      return;
    }
    try {
      await onSubmitProp(payload, initialData?.id);
      reset();
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Kunne ikke lagre bestilling.",
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="border-border bg-page-background relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border shadow-lg">
        <div className="bg-page-background sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800/80 px-5 py-4">
          <h2 className="text-lg font-semibold text-neutral-50">
            {initialData ? "Rediger bestilling" : "Legg til manuell bestilling"}
          </h2>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-neutral-400 hover:text-neutral-50"
            onClick={onClose}
            aria-label="Lukk"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form
          onSubmit={handleSubmit((data) =>
            onSubmit(data as AdminBookingFormValues),
          )}
          className="space-y-4 p-5"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">
              Type bestilling <span className="text-red-400">*</span>
            </label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v as BookingType)}
                >
                  <SelectTrigger className="border-border bg-card w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="min-w-(--radix-select-trigger-width)"
                  >
                    {Object.entries(BOOKING_TYPE_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {type === "tur" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">
                Tur <span className="text-red-400">*</span>
              </label>
              <Controller
                control={control}
                name="tour_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v || null)}
                  >
                    <SelectTrigger className="border-border bg-card w-full">
                      <SelectValue placeholder="Velg tur" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      align="start"
                      className="min-w-(--radix-select-trigger-width)"
                    >
                      {tours.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.title} – {t.price} kr
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tour_id && (
                <p className="text-sm text-red-400">{errors.tour_id.message}</p>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">
                Navn <span className="text-red-400">*</span>
              </label>
              <Input
                {...register("navn")}
                placeholder="Fullt navn"
                className="border-border bg-card"
              />
              {errors.navn && (
                <p className="text-sm text-red-400">{errors.navn.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">
                E-post <span className="text-red-400">*</span>
              </label>
              <Input
                {...register("epost")}
                type="email"
                placeholder="epost@eksempel.no"
                className="border-border bg-card"
              />
              {errors.epost && (
                <p className="text-sm text-red-400">{errors.epost.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">
              Telefon <span className="text-red-400">*</span>
            </label>
            <Input
              {...register("telefon")}
              type="tel"
              placeholder="+47 123 45 678"
              className="border-border bg-card"
            />
            {errors.telefon && (
              <p className="text-sm text-red-400">{errors.telefon.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">
                Dato <span className="text-red-400">*</span>
              </label>
              <Controller
                control={control}
                name="dato"
                render={({ field }) => (
                  <Input
                    type="date"
                    className="border-border bg-card"
                    value={
                      field.value instanceof Date
                        ? field.value.toISOString().slice(0, 10)
                        : String(field.value ?? "")
                    }
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                )}
              />
              {errors.dato && (
                <p className="text-sm text-red-400">
                  {errors.dato.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">
                Beløp (kr)
              </label>
              <Input
                {...register("belop", { valueAsNumber: true })}
                type="number"
                min={0}
                step={1}
                className="border-border bg-card"
              />
              {errors.belop && (
                <p className="text-sm text-red-400">{errors.belop.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">
              Status
            </label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v as BookingStatus)}
                >
                  <SelectTrigger className="border-border bg-card w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="min-w-(--radix-select-trigger-width)"
                  >
                    {Object.entries(BOOKING_STATUS_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {status === "delvis_betalt" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">
                Betalt beløp (kr) <span className="text-red-400">*</span>
              </label>
              <Input
                {...register("betalt_belop", { valueAsNumber: true })}
                type="number"
                min={0}
                step={1}
                placeholder="0"
                className="border-border bg-card"
              />
              {errors.betalt_belop && (
                <p className="text-sm text-red-400">
                  {errors.betalt_belop.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">
              Notater
            </label>
            <textarea
              {...register("notater")}
              placeholder="Eventuelle kommentarer (f.eks. betalt kontant)"
              rows={3}
              className="placeholder:text-muted-foreground border-border bg-card w-full resize-y rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div className="border-t border-neutral-800/80 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-300">
                Deltakere
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-[#c9682a]"
                onClick={() => append({ ...defaultParticipant })}
              >
                <Plus className="mr-1 h-4 w-4" />
                Legg til deltaker
              </Button>
            </div>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border-border bg-card rounded-lg border p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-400">
                      Deltaker {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => remove(index)}
                        aria-label="Fjern deltaker"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400">
                          Navn *
                        </label>
                        <Input
                          {...register(`participants.${index}.name`)}
                          placeholder="Fullt navn"
                          className="border-border bg-card h-9 text-sm"
                        />
                        {errors.participants?.[index]?.name && (
                          <p className="text-xs text-red-400">
                            {errors.participants[index]?.name?.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400">
                          E-post *
                        </label>
                        <Input
                          {...register(`participants.${index}.email`)}
                          type="email"
                          placeholder="epost@eksempel.no"
                          className="border-border bg-card h-9 text-sm"
                        />
                        {errors.participants?.[index]?.email && (
                          <p className="text-xs text-red-400">
                            {errors.participants[index]?.email?.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400">
                        Telefon *
                      </label>
                      <Input
                        {...register(`participants.${index}.telefon`)}
                        type="tel"
                        placeholder="+47 123 45 678"
                        className="border-border bg-card h-9 text-sm"
                      />
                      {errors.participants?.[index]?.telefon && (
                        <p className="text-xs text-red-400">
                          {errors.participants[index]?.telefon?.message}
                        </p>
                      )}
                    </div>
                    <div className="border-t border-neutral-800 pt-3">
                      <span className="text-xs font-medium text-neutral-400">
                        Nødkontakt (SOS) *
                      </span>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs text-neutral-500">
                            Navn
                          </label>
                          <Input
                            {...register(`participants.${index}.sos_navn`)}
                            placeholder="Kari Nordmann"
                            className="border-border bg-card h-9 text-sm"
                          />
                          {errors.participants?.[index]?.sos_navn && (
                            <p className="text-xs text-red-400">
                              {errors.participants[index]?.sos_navn?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-neutral-500">
                            Telefon
                          </label>
                          <Input
                            {...register(`participants.${index}.sos_telefon`)}
                            type="tel"
                            placeholder="+47 987 65 432"
                            className="border-border bg-card h-9 text-sm"
                          />
                          {errors.participants?.[index]?.sos_telefon && (
                            <p className="text-xs text-red-400">
                              {errors.participants[index]?.sos_telefon?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {submitError && <p className="text-sm text-red-400">{submitError}</p>}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="text-primary flex-1 border-orange-500 hover:bg-[#c9682a]"
              onClick={onClose}
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#dd7431] text-white hover:bg-[#c9682a]"
            >
              {isSubmitting
                ? "Lagrer…"
                : initialData
                  ? "Lagre endringer"
                  : "Legg til bestilling"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
