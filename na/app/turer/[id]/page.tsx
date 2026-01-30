import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ id: string }> };

export default async function TourDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: tour, error } = await supabase
    .from("tours")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error || !tour) notFound();

  return (
    <main className="bg-background min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/turer">← Alle turer</Link>
        </Button>
        <h1 className="text-primary mt-6 text-3xl font-bold">{tour.title}</h1>
        {tour.short_description && (
          <p className="text-muted-foreground mt-4">{tour.short_description}</p>
        )}
        {tour.long_description && (
          <div className="prose prose-invert mt-6 max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {tour.long_description}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
