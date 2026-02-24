import { CheckCircle } from "lucide-react";

const REASONS = [
  {
    title: "Sikkerhet først",
    description: "Din trygghet er vår høyeste prioritet på alle turer.",
  },
  {
    title: "Ekte opplevelser",
    description: "Vi skaper minner som varer livet ut.",
  },
  {
    title: "Små grupper",
    description: "Personlig oppfølging og sosialt fellesskap.",
  },
  {
    title: "Lokalkunnskap",
    description: "Vi kjenner de beste rutene og hemmelige perlene.",
  },
] as const;

export function WhyChooseUsSection() {
  return (
    <section className="bg-card/50 w-full py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          HVORFOR <span className="text-primary">VELGE OSS</span>
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason) => (
            <div
              key={reason.title}
              className="bg-card border-border rounded-xl border p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex justify-center">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                  <CheckCircle className="text-primary h-6 w-6" />
                </div>
              </div>
              <h3 className="text-foreground mb-2 text-base font-semibold">
                {reason.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
