import { createClient } from "@/lib/supabase/supabase-server";
import { NewsListWithPagination } from "@/components/news/NewsListWithPagination";

export const revalidate = 60;

export default async function NewsPage() {
  const supabase = await createClient();

  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Feil ved henting av nyheter:", error);
  }

  return (
    <main className="bg-background min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-8 sm:px-12 md:px-16">
        <div className="mb-12 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold sm:text-5xl">
            Nyheter
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Hold deg oppdatert med de siste nyhetene, tips og oppdateringer fra
            Norseman Adventures.
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
            <p className="font-semibold text-red-400">
              Kunne ikke hente nyheter fra databasen.
            </p>
            <p className="mt-2 text-sm text-red-300">
              Sjekk Supabase RLS-policyer og miljøvariabler.
            </p>
            <pre className="mt-4 overflow-x-auto text-left text-xs text-red-200">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        ) : news && news.length > 0 ? (
          <NewsListWithPagination news={news} />
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">
              Ingen publiserte nyheter for øyeblikket.
            </p>

            <pre className="text-muted-foreground/70 mt-6 overflow-x-auto text-left text-xs">
              {JSON.stringify({ newsCount: news?.length ?? 0, news }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
