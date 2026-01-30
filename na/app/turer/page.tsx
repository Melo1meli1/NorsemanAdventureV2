import Link from "next/link";
import { createClient } from "@/lib/supabase/supabase-server";
import { TourCard } from "@/components/tours/TourCard";
import { Button } from "@/components/ui/button";

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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} fromPage="turer" />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Ingen publiserte turer.</p>
        )}
      </div>
    </main>
  );
}
