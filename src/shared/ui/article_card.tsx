import type { ArticleItem as HomeArticleItem } from "@/features/home/infrastructure/data";
import type { ArticleItem as DomainArticleItem } from "@/features/article/domain/article.entity";
import { CalendarDays, MessageCircle } from "lucide-react";
import Image from "next/image";

export type CardArticle = DomainArticleItem | HomeArticleItem;

const colorMap: Record<string, string> = {
  red: "bg-red-600",
  blue: "bg-blue-600",
  yellow: "bg-yellow-600",
  purple: "bg-purple-600",
  green: "bg-green-600",
};

export function ArticleCard({ article }: { article: CardArticle }) {
  const imageSrc =
    article.image ||
    ("image_url" in article && article.image_url) ||
    "/login-hero.jpg";

  const category =
    article.category ||
    ("source" in article && article.source) ||
    "Actualité";

  const colorClass =
    (article.color && colorMap[article.color]) || "bg-red-600";

  const description =
    article.description ||
    ("content" in article && article.content) ||
    "";

  const date =
    article.date ||
    ("created_at" in article && article.created_at
      ? new Date(article.created_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "");

  const nbComs = article.nbComs ?? 0;

  return (
    <article
      key={article.title}
      className="group flex cursor-pointer flex-col border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={article.title}
          loading="eager"
          fill
          unoptimized={typeof imageSrc === "string" && imageSrc.startsWith("http")}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="gap-3 p-4">
        <div className="flex items-center mb-3">
          <div className={`w-1 h-4 mr-2 ${colorClass}`} />
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {category}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-red-600">
            {article.title}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
            {description}
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <CalendarDays size={14} />
              {date}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={14} />
              {nbComs}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
