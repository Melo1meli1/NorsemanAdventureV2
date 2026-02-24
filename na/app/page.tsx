import { createClient } from "@/lib/supabase/supabase-server";
import { UpcomingToursSection } from "@/components/tours/UpcomingToursSection";
import { HeroCarousel } from "@/components/HeroCarousel";
import { WhoAreWeSection } from "@/components/WhoAreWeSection";

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();
  const { data: tours } = await supabase
    .from("tours")
    .select("*")
    .eq("status", "published")
    .order("start_date", { ascending: true })
    .limit(3);

  return (
    <main className="bg-background min-h-screen">
      <HeroCarousel />
      <UpcomingToursSection tours={tours ?? []} />
      <WhoAreWeSection />
    </main>
  );
}
