import type { ArticleItem as HomeArticleItem } from "@/features/home/infrastructure/data";
import type {
  ArticleItem as DomainArticleItem,
  ArticleStatus,
} from "@/features/article/domain/article.entity";
import {
  AlertOctagon,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FacebookIcon, GoogleIcon } from "../layout/icon";

export type CardArticle = DomainArticleItem | HomeArticleItem;

const colorMap: Record<string, string> = {
  red: "bg-red-600",
  blue: "bg-blue-600",
  yellow: "bg-yellow-600",
  purple: "bg-purple-600",
  green: "bg-green-600",
};

export function renderStatusBadge(status?: ArticleStatus | string) {
  if (!status) return null;
  const s = status.toLowerCase();

  switch (s) {
    case "verified":
    case "verifie":
    case "vérifié":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
          <CheckCircle2 size={13} strokeWidth={2.5} />
          Vérifié
        </span>
      );

    case "fake":
    case "fakenews":
    case "fake news":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md animate-pulse">
          <AlertOctagon size={13} strokeWidth={2.5} />
          Fake News
        </span>
      );

    case "unverified":
    case "non verifie":
    case "non vérifié":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
          <AlertTriangle size={13} strokeWidth={2.5} />
          Non vérifié
        </span>
      );

    case "pending":
    case "en attente":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/85 px-2.5 py-1 text-xs font-medium text-white shadow-md backdrop-blur-md">
          <Clock size={13} strokeWidth={2} />
          En cours
        </span>
      );

    default:
      return null;
  }
}

export function ArticleCard({
  article,
  onClick,
}: {
  article: CardArticle;
  onClick?: (article: CardArticle) => void;
}) {
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
  const status = "status" in article ? article.status : undefined;
  const isFake = status?.toLowerCase() === "fake";
  const isVerified = status?.toLowerCase() === "verified";
  const router = useRouter();

  const handleCardClick = () => {
    if (onClick) {
      onClick(article);
    } else if ("id" in article && article.id !== undefined && article.id !== null) {
      router.push(`/actualites/${article.id}`);
    }
  };

  return (
    <article
      key={article.title}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      role="button"
      tabIndex={0}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white transition hover:shadow-lg dark:bg-neutral-900 ${
        isFake
          ? "border-red-300 ring-1 ring-red-200 dark:border-red-900/60 dark:ring-red-900/40"
          : isVerified
          ? "border-emerald-300/80 dark:border-emerald-900/60"
          : "border-gray-200 dark:border-neutral-800"
      }`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
        <Image
          src={imageSrc}
          alt={article.title}
          loading="eager"
          fill
          unoptimized={typeof imageSrc === "string" && imageSrc.startsWith("http")}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Badge Statut en haut à droite (Vérifié / Fake News / etc.)
        <div className="absolute top-2.5 right-2.5 z-10">
          {renderStatusBadge(status)}
        </div> */}


        {/* Badge source originale en bas à gauche si disponible */}
        {"source" in article && article.source && (
          <div className="absolute bottom-2 left-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase text-white backdrop-blur-sm flex gap-1 py-1 items-center">
            {
                article.source == "facebook" ?
                <div className="text-blue-400 dark:bg-blue-950/60 dark:text-blue-300">
                  <FacebookIcon/>
                </div>: 
                <GoogleIcon /> 
            }
            {
              article.source
            }
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center">
              <div className={`w-1 h-3.5 mr-2 rounded-full ${colorClass}`} />
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {category}
              </span>
            </div>
            {isFake && (
              <span className="text-[11px] font-extrabold tracking-wide text-red-600 dark:text-red-400">
                FAUX
              </span>
            )}
            {isVerified && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                CONFIRMÉ
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-red-600 dark:text-white dark:group-hover:text-red-400 line-clamp-2">
            {article.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400 dark:border-neutral-800">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} />
            {date}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle size={13} />
            {nbComs}
          </span>
        </div>
      </div>
    </article>
  );
}
