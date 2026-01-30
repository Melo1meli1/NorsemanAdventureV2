import { createClient } from "@/lib/supabase/supabase-server";
import { UpcomingToursSection } from "@/components/tours/UpcomingToursSection";

export default async function Home() {
  const supabase = await createClient();
  const { data: tours } = await supabase
    .from("tours")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="bg-background min-h-screen">
      <UpcomingToursSection tours={tours ?? []} />
    </main>
  );
}
