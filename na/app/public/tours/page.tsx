import Link from "next/link";
import { createClient } from "@/lib/supabase/supabase-server";
import { Button } from "@/components/ui/button";
import { ToursListWithPagination } from "@/components/tours/ToursListWithPagination";

export default async function TurerPage() {
  const supabase = await createClient();
  const { data: tours } = await supabase
    .from("tours")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

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
