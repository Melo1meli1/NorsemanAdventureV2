import Image from "next/image";
import { Calendar } from "lucide-react";
import type { News } from "@/lib/types/news";
import { cn } from "@/lib/utils";

type NewsCardProps = {
  news: News;
  className?: string;
};

export function NewsCard({ news, className }: NewsCardProps) {
  const imageUrl = news.image_url || "/tour-summer.jpg";
  const displayDate = news.published_at || news.created_at;
  const formattedDate = new Date(displayDate).toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article
      className={cn(
        "bg-card text-card-foreground flex w-full flex-col overflow-hidden rounded-2xl border border-transparent shadow-md sm:flex-row",
        className,
      )}
    >
      {/* Text — left side */}
      <div className="flex flex-1 flex-col justify-between p-8 sm:p-10">
        <div>
          <div className="text-primary mb-3 flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          <h3 className="text-foreground mb-3 text-xl leading-snug font-bold sm:text-2xl">
            {news.title}
          </h3>

          {news.short_description && (
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed sm:text-base">
              {news.short_description}
            </p>
          )}

          {news.content && (
            <div
              className="text-muted-foreground prose prose-invert max-w-none text-sm leading-relaxed sm:text-base"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          )}
        </div>
      </div>

      {/* Image container — right side */}
      <div className="border-t border-neutral-800 sm:border-t-0 sm:border-l">
        <div className="relative h-56 w-full sm:h-full sm:w-56 md:w-72 lg:w-80">
          <Image
            src={imageUrl}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 224px, (max-width: 1024px) 288px, 320px"
          />
        </div>
      </div>
    </article>
  );
}
