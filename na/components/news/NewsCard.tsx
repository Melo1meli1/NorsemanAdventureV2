import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import type { News } from "@/lib/types/news";
import { cn } from "@/lib/utils";

type NewsCardProps = {
  news: News;
  className?: string;
};

export function NewsCard({ news, className }: NewsCardProps) {
  const detailHref = `/public/news/${news.id}`;
  const imageUrl = news.image_url || "/tour-summer.jpg";
  const displayDate = news.published_at || news.created_at;
  const formattedDate = new Date(displayDate).toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={detailHref}
      aria-label={`Les mer om ${news.title}`}
      className="focus-visible:ring-primary focus-visible:ring-offset-background hover:border-primary/50 block rounded-xl transition-all hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <article
        className={cn(
          "bg-card text-card-foreground mx-auto flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-transparent shadow-lg sm:max-w-md md:h-96 md:max-w-none lg:h-134",
          className,
        )}
      >
        <div className="relative aspect-16/10 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          <h3 className="text-foreground mb-2 text-lg font-bold">
            {news.title}
          </h3>

          {news.short_description && (
            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm sm:line-clamp-3">
              {news.short_description}
            </p>
          )}

          {/* Show a preview of the content if available */}
          {news.content && (
            <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
              {news.content.replace(/<[^>]*>/g, "")} {/* Strip HTML tags */}
            </p>
          )}

          <div className="border-primary text-foreground hover:bg-primary/10 mt-auto inline-flex w-fit items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors">
            LES MER →
          </div>
        </div>
      </article>
    </Link>
  );
}
