const TEAM_MEMBERS = [
  {
    name: "Geir",
    role: "Grunnlegger & Guide",
    experience: "15+ års erfaring",
    initial: "G",
  },
  {
    name: "Vegard",
    role: "Turkoordinator",
    experience: "10+ års erfaring",
    initial: "V",
  },
  {
    name: "Kristian",
    role: "Guide & Mekaniker",
    experience: "8+ års erfaring",
    initial: "K",
  },
] as const;

export function MeetTheTeamSection() {
  return (
    <section className="bg-background w-full py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          MØT <span className="text-primary">TEAMET</span>
        </h2>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.name}
              className="bg-card border-border flex flex-col items-center rounded-xl border p-8 shadow-sm"
            >
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-700 text-2xl font-bold text-white">
                {member.initial}
              </div>
              <h3 className="text-foreground text-lg font-semibold">
                {member.name}
              </h3>
              <p className="text-primary mt-1 text-sm font-medium">
                {member.role}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {member.experience}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
