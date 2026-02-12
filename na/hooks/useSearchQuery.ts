"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

const DEFAULT_QUERY_PARAM = "query";

/**
 * Leser søkestrengen fra URL (samme param som SearchInput skriver til).
 * Bruk i Bestillinger, Turer, Nyheter osv. så alle bruker samme kilde.
 */
export function useSearchQuery(
  queryParamKey: string = DEFAULT_QUERY_PARAM,
): string {
  const searchParams = useSearchParams();
  const raw = searchParams.get(queryParamKey) ?? "";
  return raw.trim();
}

/**
 * Filtrerer en liste på tvers av angitte nøkler basert på søk.
 * - overrideQuery: bruk lokal state (f.eks. Turer med syncToUrl=false) – ingen URL-kall.
 * - Ellers leses query fra URL (useSearchQuery). Bestillinger bruker server-side og useSearchQuery().
 */
export function useFilteredBySearch<T extends Record<string, unknown>>(
  items: T[],
  keys: ReadonlyArray<keyof T>,
  options?: { queryParamKey?: string; overrideQuery?: string },
): T[] {
  const urlQuery = useSearchQuery(options?.queryParamKey);
  const query = (options?.overrideQuery ?? urlQuery).toLowerCase();

  return useMemo(() => {
    if (!query) return items;
    return items.filter((item) =>
      keys.some((key) =>
        String(item[key] ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [items, keys, query]);
}
