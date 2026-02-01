"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  bookingFormSchema,
  type BookingFormValues,
} from "@/lib/zod/bookingValidation";
import { cn } from "@/lib/utils";

export type ParticipantBookingFormRef = {
  triggerSubmit: () => void;
};

type ParticipantBookingFormProps = {
  participantCount: number;
  onValid?: (data: BookingFormValues) => void;
  className?: string;
};

export const ParticipantBookingForm = forwardRef<
  ParticipantBookingFormRef,
  ParticipantBookingFormProps
>(function ParticipantBookingForm(
  { participantCount, onValid, className },
  ref,
) {
  const submitRef = useRef<HTMLFormElement>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      participants: Array.from({ length: participantCount }, () => ({
        name: "",
        email: "",
        telefon: "",
        sos_navn: "",
        sos_telefon: "",
      })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "participants",
  });

  useImperativeHandle(ref, () => ({
    triggerSubmit: () => {
      submitRef.current?.requestSubmit();
    },
  }));

  return (
    <form
      ref={submitRef}
      onSubmit={handleSubmit((data) => onValid?.(data))}
      className={cn("flex flex-col gap-6", className)}
      aria-label="Deltaker- og kontaktinformasjon"
      noValidate
    >
      <h2 className="text-foreground text-lg font-bold">Deltakerinformasjon</h2>
      <p className="text-muted-foreground text-sm">
        Fyll ut navn, e-post, telefonnummer og kontaktperson ved nødstilfeller
        for hver deltaker.
      </p>

      <div className="flex flex-col gap-6">
        {fields.map((field, index) => (
          <Card key={field.id} className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Deltaker {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor={`participants.${index}.name`}
                    className="text-foreground text-sm font-medium"
                  >
                    Navn <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id={`participants.${index}.name`}
                    type="text"
                    placeholder="Fullt navn"
                    autoComplete="name"
                    className="h-10"
                    {...register(`participants.${index}.name`)}
                    aria-invalid={Boolean(errors.participants?.[index]?.name)}
                  />
                  {errors.participants?.[index]?.name && (
                    <p className="text-destructive text-sm">
                      {errors.participants[index]?.name?.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor={`participants.${index}.telefon`}
                    className="text-foreground text-sm font-medium"
                  >
                    Telefonnummer <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id={`participants.${index}.telefon`}
                    type="tel"
                    placeholder="+47 123 45 678"
                    autoComplete="tel"
                    className="h-10"
                    {...register(`participants.${index}.telefon`)}
                    aria-invalid={Boolean(
                      errors.participants?.[index]?.telefon,
                    )}
                  />
                  {errors.participants?.[index]?.telefon && (
                    <p className="text-destructive text-sm">
                      {errors.participants[index]?.telefon?.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`participants.${index}.email`}
                  className="text-foreground text-sm font-medium"
                >
                  E-post <span className="text-destructive">*</span>
                </label>
                <Input
                  id={`participants.${index}.email`}
                  type="email"
                  placeholder="epost@eksempel.no"
                  autoComplete="email"
                  className="h-10"
                  {...register(`participants.${index}.email`)}
                  aria-invalid={Boolean(errors.participants?.[index]?.email)}
                />
                {errors.participants?.[index]?.email && (
                  <p className="text-destructive text-sm">
                    {errors.participants[index]?.email?.message}
                  </p>
                )}
              </div>
              <div className="border-border mt-4 border-t pt-4">
                <h3 className="text-foreground mb-3 text-sm font-semibold">
                  Kontaktperson ved nødstilfeller
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`participants.${index}.sos_navn`}
                      className="text-foreground text-sm font-medium"
                    >
                      Navn <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id={`participants.${index}.sos_navn`}
                      type="text"
                      placeholder="Kari Nordmann"
                      autoComplete="name"
                      className="h-10"
                      {...register(`participants.${index}.sos_navn`)}
                      aria-invalid={Boolean(
                        errors.participants?.[index]?.sos_navn,
                      )}
                    />
                    {errors.participants?.[index]?.sos_navn && (
                      <p className="text-destructive text-sm">
                        {errors.participants[index]?.sos_navn?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`participants.${index}.sos_telefon`}
                      className="text-foreground text-sm font-medium"
                    >
                      Telefon <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id={`participants.${index}.sos_telefon`}
                      type="tel"
                      placeholder="+47 987 65 432"
                      autoComplete="tel"
                      className="h-10"
                      {...register(`participants.${index}.sos_telefon`)}
                      aria-invalid={Boolean(
                        errors.participants?.[index]?.sos_telefon,
                      )}
                    />
                    {errors.participants?.[index]?.sos_telefon && (
                      <p className="text-destructive text-sm">
                        {errors.participants[index]?.sos_telefon?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hidden submit used when parent triggers submit via ref */}
      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden>
        Send inn
      </button>
    </form>
  );
});
