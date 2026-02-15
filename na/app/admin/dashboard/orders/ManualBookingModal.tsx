"use client";

import { useEffect, useState } from "react";
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

type ManualBookingModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: AdminBookingFormValues) => void | Promise<void>;
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

export function ManualBookingModal({
  open,
  onClose,
  onSubmit: onSubmitProp,
}: ManualBookingModalProps) {
  const [tours, setTours] = useState<TourOption[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    defaultValues: {
      type: "tur",
      tour_id: null,
      navn: "",
      epost: "",
      telefon: "",
      dato: new Date(),
      status: "ikke_betalt",
      belop: 0,
      notater: null,
      participants: [{ ...defaultParticipant }],
    },
  });

  const type = useWatch({ control, name: "type", defaultValue: "tur" });
  const tourId = useWatch({ control, name: "tour_id", defaultValue: null });
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
    if (type !== "tur") {
      setValue("tour_id", null);
      setValue("belop", 0);
      return;
    }
    const tour = tours.find((t) => t.id === tourId);
    if (tour) setValue("belop", tour.price);
  }, [type, tourId, tours, setValue]);

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
      await onSubmitProp(payload);
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
      <div className="border-border bg-card relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border shadow-lg">
        <div className="bg-card sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800/80 px-5 py-4">
          <h2 className="text-lg font-semibold text-neutral-50">
            Legg til manuell bestilling
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
                  <SelectTrigger className="w-full border-neutral-600 bg-neutral-800">
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
                    <SelectTrigger className="w-full border-neutral-600 bg-neutral-800">
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
                className="border-neutral-600 bg-neutral-800"
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
                className="border-neutral-600 bg-neutral-800"
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
              className="border-neutral-600 bg-neutral-800"
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
                    className="border-neutral-600 bg-neutral-800"
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
                className="border-neutral-600 bg-neutral-800"
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
                  <SelectTrigger className="w-full border-neutral-600 bg-neutral-800">
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">
              Notater
            </label>
            <textarea
              {...register("notater")}
              placeholder="Eventuelle kommentarer (f.eks. betalt kontant)"
              rows={3}
              className="placeholder:text-muted-foreground w-full resize-y rounded-md border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm"
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
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
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
                  className="rounded-lg border border-neutral-600 bg-neutral-800/60 p-4"
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
                          className="h-9 border-neutral-600 bg-neutral-800 text-sm"
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
                          className="h-9 border-neutral-600 bg-neutral-800 text-sm"
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
                        className="h-9 border-neutral-600 bg-neutral-800 text-sm"
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
                            className="h-9 border-neutral-600 bg-neutral-800 text-sm"
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
                            className="h-9 border-neutral-600 bg-neutral-800 text-sm"
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
              className="flex-1 border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
              onClick={onClose}
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#dd7431] text-white hover:bg-[#c9682a]"
            >
              {isSubmitting ? "Lagrer…" : "Legg til bestilling"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
