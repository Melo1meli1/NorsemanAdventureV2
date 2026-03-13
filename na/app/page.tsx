import { UpcomingToursSection } from "@/components/tours/UpcomingToursSection";
import { HeroCarousel } from "@/components/HeroCarousel";
import { WhoAreWeSection } from "@/components/WhoAreWeSection";
import { HomepageVisitTracker } from "@/components/HomepageVisitTracker";

//export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <main className="bg-background min-h-screen">
      <HomepageVisitTracker />
      <HeroCarousel />
      <UpcomingToursSection />
      <WhoAreWeSection />
    </main>
  );
}
