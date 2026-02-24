export default function NewsLoading() {
  return (
    <main className="bg-background min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-8 sm:px-12 md:px-16">
        <div className="animate-shimmer mb-8 h-9 w-24 rounded bg-neutral-800" />
        <div className="animate-shimmer mb-8 h-9 w-40 rounded bg-neutral-800" />
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-card flex flex-col overflow-hidden rounded-2xl shadow-md sm:flex-row"
            >
              {/* Text skeleton */}
              <div className="flex flex-1 flex-col gap-3 p-8 sm:p-10">
                <div className="animate-shimmer h-4 w-32 rounded bg-neutral-800" />
                <div className="animate-shimmer h-7 w-3/4 rounded bg-neutral-800" />
                <div className="animate-shimmer h-4 w-full rounded bg-neutral-800" />
                <div className="animate-shimmer h-4 w-full rounded bg-neutral-800" />
                <div className="animate-shimmer h-4 w-2/3 rounded bg-neutral-800" />
              </div>
              {/* Image skeleton */}
              <div className="border-t border-neutral-800 sm:border-t-0 sm:border-l">
                <div className="animate-shimmer h-56 w-full bg-neutral-800 sm:h-full sm:w-56 md:w-72 lg:w-80" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
