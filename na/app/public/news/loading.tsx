export default function NewsLoading() {
  return (
    <main className="bg-background min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-10">
        <div className="animate-shimmer mb-8 h-9 w-24 rounded bg-neutral-800" />
        <div className="animate-shimmer mb-8 h-9 w-40 rounded bg-neutral-800" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card flex flex-col overflow-hidden rounded-xl"
            >
              <div className="animate-shimmer aspect-16/10 w-full rounded bg-neutral-800" />
              <div className="flex flex-col gap-3 p-5">
                <div className="animate-shimmer h-4 w-1/3 rounded bg-neutral-800" />
                <div className="animate-shimmer h-5 w-3/4 rounded bg-neutral-800" />
                <div className="animate-shimmer h-4 w-full rounded bg-neutral-800" />
                <div className="animate-shimmer h-4 w-2/3 rounded bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
