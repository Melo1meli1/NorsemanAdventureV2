import { z } from "zod";

export const subscribeSchema = z.object({
  email: z
    .string({
      required_error: "E-post er påkrevd",
    })
    .email("Ugyldig e-postadresse")
    .trim(),
});

export const unsubscribeSchema = z.object({
  email: z
    .string({
      required_error: "E-post er påkrevd",
    })
    .email("Ugyldig e-postadresse")
    .trim(),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>;
