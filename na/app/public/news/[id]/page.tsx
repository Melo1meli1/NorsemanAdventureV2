import Link from "next/link";
import { createClient } from "@/lib/supabase/supabase-server";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error || !news) {
    return (
      <main className="bg-background min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 md:px-10">
          <div className="mb-8 flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/public/news">← Tilbake til nyheter</Link>
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-foreground mb-4 text-2xl font-bold">
              Nyhet ikke funnet
            </h1>
            <p className="text-muted-foreground mb-8">
              Beklager, nyheten du ser etter finnes ikke eller er ikke
              publisert.
            </p>
            <Button asChild>
              <Link href="/public/news">Se alle nyheter</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const imageUrl = news.image_url || "/tour-summer.jpg";
  const displayDate = news.published_at || news.created_at;
  const formattedDate = new Date(displayDate).toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="bg-background min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-6 sm:px-8 md:px-10">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/public/news">← Tilbake til nyheter</Link>
          </Button>
        </div>

        <article className="prose prose-invert max-w-none">
          {/* Header */}
          <header className="mb-8">
            <div className="text-muted-foreground mb-4 text-sm">
              {formattedDate}
            </div>
            <h1 className="text-primary mb-4 text-3xl font-bold md:text-4xl">
              {news.title}
            </h1>
            {news.short_description && (
              <p className="text-muted-foreground text-lg italic">
                {news.short_description}
              </p>
            )}
          </header>

          {/* Featured Image */}
          {news.image_url && (
            <div className="mb-8">
              <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl">
                <Image
                  src={imageUrl}
                  alt={news.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert">
            {news.content ? (
              <div dangerouslySetInnerHTML={{ __html: news.content }} />
            ) : (
              <p className="text-muted-foreground">
                Ingen innhold tilgjengelig for denne nyheten.
              </p>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
