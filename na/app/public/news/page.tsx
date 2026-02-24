import { createClient } from "@/lib/supabase/supabase-server";
import { NewsListWithPagination } from "@/components/news/NewsListWithPagination";

export const revalidate = 60;

export default async function NewsPage() {
  const supabase = await createClient();
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <main className="bg-background min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-8 sm:px-12 md:px-16">
        {/* Page header */}
        <div className="mb-12 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold sm:text-5xl">
            Nyheter
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Hold deg oppdatert med de siste nyhetene, tips og oppdateringer fra
            NorseMan Adventures.
          </p>
        </div>

        {news && news.length > 0 ? (
          <NewsListWithPagination news={news} />
        ) : (
          <p className="text-muted-foreground text-center">
            Ingen publiserte nyheter for øyeblikket.
          </p>
        )}
      </div>
    </main>
  );
}
