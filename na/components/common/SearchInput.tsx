"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchInputProps = {
  placeholder: string;
  queryParamKey?: string;
  className?: string;
};

/**
 * Gjenbrukbar søkekomponent som:
 * - Leser initialverdi fra URL (`searchParams`)
 * - Debouncer brukerens input
 * - Oppdaterer URL-en (router.replace) i stedet for å holde søkeresultater i lokal state
 *
 * Selve filtreringen gjøres på serveren ved å lese `searchParams[queryParamKey]`.
 */
export function SearchInput({
  placeholder,
  queryParamKey = "query",
  className,
}: SearchInputProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initial verdi hentes fra URL, slik at Refresh / deling av lenke fungerer.
  const initialQuery = searchParams.get(queryParamKey) ?? "";
  const [value, setValue] = useState(initialQuery);

  // Debounce for å unngå unødvendige fetch-kall mens bruker skriver.
  const [debouncedValue, setDebouncedValue] = useState(initialQuery);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value]);

  useEffect(() => {
    const currentQueryInUrl = searchParams.get(queryParamKey) ?? "";

    // Hvis URL allerede matcher debounced verdi, trenger vi ikke å gjøre noe.
    if (debouncedValue === currentQueryInUrl) return;

    const params = new URLSearchParams(searchParams.toString());

    if (debouncedValue && debouncedValue.trim().length > 0) {
      params.set(queryParamKey, debouncedValue.trim());
      // Her kan man evt. resette paginering: params.delete("page");
    } else {
      params.delete(queryParamKey);
    }

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(url);
  }, [debouncedValue, pathname, queryParamKey, router, searchParams]);

  const handleClear = () => {
    setValue("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete(queryParamKey);
    // params.delete("page");

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(url);
  };

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      {/* Søk-ikon til venstre */}
      <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-neutral-500">
        <Search className="h-4 w-4" aria-hidden />
      </span>

      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="bg-card border-neutral-800 pr-8 pl-8"
        autoComplete="off"
      />

      {value && value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 flex items-center"
          aria-label="Tøm søk"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
