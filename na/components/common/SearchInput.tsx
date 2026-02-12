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
  syncToUrl?: boolean;
  onChange?: (value: string) => void;
};

/**
 * Søk leser/skriver URL når syncToUrl er true (default). Da overlever søk refresh (Bestillinger, Turer, Nyheter).
 * syncToUrl false = kun lokal state + onChange, ingen URL (brukes ikke lenger – vi bruker URL overalt).
 */
export function SearchInput({
  placeholder,
  queryParamKey = "query",
  className,
  syncToUrl = true,
  onChange,
}: SearchInputProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const initialQuery = syncToUrl ? (searchParams.get(queryParamKey) ?? "") : "";
  const [value, setValue] = useState(initialQuery);
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
    const trimmed = debouncedValue.trim();
    if (syncToUrl) {
      const currentQueryInUrl = searchParams.get(queryParamKey) ?? "";
      if (trimmed === currentQueryInUrl) return;

      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) params.set(queryParamKey, trimmed);
      else params.delete(queryParamKey);
      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(url);
    } else {
      onChange?.(trimmed);
    }
  }, [
    debouncedValue,
    pathname,
    queryParamKey,
    router,
    searchParams,
    syncToUrl,
    onChange,
  ]);

  const handleClear = () => {
    setValue("");
    if (syncToUrl) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(queryParamKey);
      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(url);
    } else {
      onChange?.("");
    }
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
