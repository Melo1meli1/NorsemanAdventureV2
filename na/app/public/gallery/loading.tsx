export default function GalleryLoading() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero skeleton */}
      <div className="animate-shimmer relative h-[50vh] w-full rounded bg-neutral-800" />
      {/* Grid skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 md:px-10">
        <div className="animate-shimmer mb-8 h-10 w-48 rounded bg-neutral-800" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-shimmer aspect-square w-full rounded-lg bg-neutral-800"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
