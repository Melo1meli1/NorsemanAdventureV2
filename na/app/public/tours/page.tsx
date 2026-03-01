/* original kode
import Link from "next/link";
import { createClient } from "@/lib/supabase/supabase-server";
import { Button } from "@/components/ui/button";
import { ToursListWithPagination } from "@/components/tours/ToursListWithPagination";

export const revalidate = 60;

export default async function TurerPage() {
  const supabase = await createClient();
  const { data: tours } = await supabase
    .from("tours")
    .select("*")
    .eq("status", "published")
    .order("start_date", { ascending: true });

  return (
    <main className="bg-background min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-10">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">← Tilbake</Link>
          </Button>
        </div>
        <h1 className="text-primary mb-8 text-3xl font-bold">Alle turer</h1>
        {tours && tours.length > 0 ? (
          <ToursListWithPagination tours={tours} />
        ) : (
          <p className="text-muted-foreground">Ingen publiserte turer.</p>
        )}
      </div>
    </main>
  );
}
*/
import { createClient } from "@/lib/supabase/supabase-server";
import { ToursListWithPagination } from "@/components/tours/ToursListWithPagination";
import type { ToursListWithPaginationProps } from "@/components/tours/ToursListWithPagination";

export const revalidate = 60;

type TourForList = ToursListWithPaginationProps["tours"][number];

function toDate(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isFinished(t: TourForList) {
  const end = toDate(t.end_date);
  if (!end) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  return endDay < today;
}

export default async function TurerPage() {
  const supabase = await createClient();

  const { data: toursRaw } = await supabase
    .from("tours")
    .select("*")
    .eq("status", "published");

  const tours = (toursRaw ?? []).slice().sort((a, b) => {
    // a og b er "unknown-ish" her, så vi caster én gang til riktig type
    const ta = a as TourForList;
    const tb = b as TourForList;

    const aFinished = isFinished(ta);
    const bFinished = isFinished(tb);

    if (aFinished !== bFinished) return aFinished ? 1 : -1;

    const aStart = toDate(ta.start_date)?.getTime() ?? Number.POSITIVE_INFINITY;
    const bStart = toDate(tb.start_date)?.getTime() ?? Number.POSITIVE_INFINITY;
    return aStart - bStart;
  });

  return (
    <main className="bg-background min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-10">
        <h1 className="text-primary mb-8 text-3xl font-bold">Alle turer</h1>

        {tours.length > 0 ? (
          <ToursListWithPagination tours={tours as TourForList[]} />
        ) : (
          <p className="text-muted-foreground">Ingen publiserte turer.</p>
        )}
      </div>
    </main>
  );
}
