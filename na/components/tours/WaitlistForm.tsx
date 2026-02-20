"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { joinWaitlistFromPublic } from "@/app/public/tours/[id]/bestill/actions";
import { cn } from "@/lib/utils";

type WaitlistFormProps = {
  tourId: string;
  className?: string;
  onSuccess?: (data: { name: string; email: string }) => void;
};

export function WaitlistForm({
  tourId,
  className,
  onSuccess,
}: WaitlistFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await joinWaitlistFromPublic({
        tourId,
        name,
        email,
      });

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Kunne ikke sette deg på venteliste",
          description: result.error,
        });
        return;
      }

      toast({
        title: "Du er satt på venteliste",
        description: `Din plass i køen er #${result.position}. Vi sender deg e-post hvis det blir en ledig plass.`,
      });

      onSuccess?.({ name, email });

      setName("");
      setEmail("");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "border-border bg-muted/10 flex flex-col gap-3 rounded-lg border p-4",
        className,
      )}
      aria-label="Sett meg på venteliste"
    >
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <Clock className="size-4" aria-hidden />
        <span>
          Turen er utsolgt. Fyll inn navn og e-post for å sette deg på
          venteliste (1 plass).
        </span>
      </div>
      <div className="grid gap-2 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-foreground text-xs font-medium">Navn *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-background border-border text-foreground focus-visible:ring-primary h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-foreground text-xs font-medium">E-post *</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-background border-border text-foreground focus-visible:ring-primary h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
          />
        </label>
      </div>
      <Button
        type="submit"
        size="lg"
        variant="outline"
        disabled={isPending}
        className="border-primary text-primary hover:bg-primary/10 w-full gap-2 font-semibold tracking-wide uppercase"
      >
        Sett meg på venteliste
      </Button>
    </form>
  );
}
