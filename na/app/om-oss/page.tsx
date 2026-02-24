import { PageHero } from "@/components/common/PageHero";
import { AboutSection } from "@/components/om-oss/AboutSection";
import { WhyChooseUsSection } from "@/components/om-oss/WhyChooseUsSection";
import { MeetTheTeamSection } from "@/components/om-oss/MeetTheTeamSection";
import { ContactSection } from "@/components/om-oss/ContactSection";

export default function OmOssPage() {
  return (
    <main className="bg-background min-h-screen">
      <PageHero
        title="OM OSS"
        subtitle="Hvem vi er og hva vi står for"
        image="/hero-motorcycle.jpg"
        imageAlt="Motorsyklist kjører mot solnedgang i norske fjell"
      />
      <AboutSection />
      <WhyChooseUsSection />
      <MeetTheTeamSection />
      <ContactSection />
    </main>
  );
}
