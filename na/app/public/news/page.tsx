import Link from "next/link";
import { createClient } from "@/lib/supabase/supabase-server";
import { Button } from "@/components/ui/button";
import { NewsListWithPagination } from "@/components/news/NewsListWithPagination";

export default async function NewsPage() {
  const supabase = await createClient();
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <main className="bg-background min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-10">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">← Tilbake</Link>
          </Button>
        </div>
        <h1 className="text-primary mb-8 text-3xl font-bold">Nyheter</h1>
        {news && news.length > 0 ? (
          <NewsListWithPagination news={news} />
        ) : (
          <p className="text-muted-foreground">Ingen publiserte nyheter.</p>
        )}
      </div>
    </main>
  );
}
