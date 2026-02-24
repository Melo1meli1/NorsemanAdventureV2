export default function HomeLoading() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero skeleton */}
      <div className="animate-shimmer relative h-screen w-full rounded bg-neutral-900" />
      {/* Tours section skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 flex flex-col items-center gap-3">
          <div className="animate-shimmer h-9 w-64 rounded bg-neutral-800" />
          <div className="animate-shimmer h-5 w-96 rounded bg-neutral-800" />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-card flex flex-col overflow-hidden rounded-xl"
            >
              <div className="animate-shimmer aspect-16/10 w-full rounded bg-neutral-800" />
              <div className="flex flex-col gap-3 p-5">
                <div className="animate-shimmer h-5 w-3/4 rounded bg-neutral-800" />
                <div className="animate-shimmer h-4 w-full rounded bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
