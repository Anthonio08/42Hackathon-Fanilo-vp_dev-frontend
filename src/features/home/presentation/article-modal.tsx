"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  ExternalLink,
  Heart,
  MessageCircle,
  Send,
  Share2,
  ShieldCheck,
  User as UserIcon,
  X,
  Check,
} from "lucide-react";
import type { CardArticle } from "@/shared/ui/article_card";
import { renderStatusBadge } from "@/shared/ui/article_card";

interface ArticleComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

interface ArticleModalProps {
  article: CardArticle | null;
  onClose: () => void;
}

export function ArticleModal({ article, onClose }: ArticleModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [likes, setLikes] = useState(14);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<ArticleComment[]>([
    {
      id: "1",
      author: "Mamy R.",
      text: "Merci pour cette information vérifiée, c'est crucial de démêler le vrai du faux.",
      date: "Il y a 25 min",
    },
    {
      id: "2",
      author: "Hery T.",
      text: "La gendarmerie a effectivement confirmé les faits sur les ondes locales.",
      date: "Il y a 1h",
    },
  ]);

  // Fermeture par la touche Échap
  useEffect(() => {
    if (!article) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [article, onClose]);

  if (!article) return null;

  const imageSrc =
    article.image ||
    ("image_url" in article && article.image_url) ||
    "/login-hero.jpg";

  const category =
    article.category ||
    ("source" in article && article.source) ||
    "Actualité";

  const content =
    article.description ||
    ("content" in article && article.content) ||
    "";

  const date =
    article.date ||
    ("created_at" in article && article.created_at
      ? new Date(article.created_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Récemment");

  const author =
    ("author" in article && article.author) ||
    ("source" in article && article.source
      ? `Source: ${article.source}`
      : "Rédaction IFM");

  const sourceUrl =
    "source_url" in article && typeof article.source_url === "string"
      ? article.source_url
      : null;

  const status = "status" in article ? article.status : undefined;

  // Paragraphes
  const paragraphs: string[] =
    "paragraphs" in article && Array.isArray(article.paragraphs) && article.paragraphs.length > 0
      ? article.paragraphs
      : content
      ? content.split("\n\n").filter(Boolean)
      : [content || article.title];

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(
          sourceUrl || window.location.href
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // Ignorer
    }
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentInput.trim();
    if (!trimmed) return;

    setComments((prev) => [
      {
        id: String(Date.now()),
        author: "Vous (Citoyen)",
        text: trimmed,
        date: "À l'instant",
      },
      ...prev,
    ]);
    setCommentInput("");
  };

  const handleVerify = () => {
    onClose();
    router.push(`/verify?claim=${encodeURIComponent(article.title)}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Arrière-plan flouté */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Conteneur de l'article */}
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition dark:bg-neutral-900">
        {/* Barre d'en-tête modal */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {category}
            </span>
            {renderStatusBadge(status)}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la vue de l'article"
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corps défilable */}
        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          {/* Image de couverture */}
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-800">
            <Image
              src={imageSrc}
              alt={article.title}
              fill
              unoptimized={typeof imageSrc === "string" && imageSrc.startsWith("http")}
              className="object-cover"
            />
          </div>

          {/* Métadonnées de publication */}
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <UserIcon size={14} className="text-red-600" />
              {author}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} />
              {date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              Lecture ~ 2 min
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-xl font-extrabold leading-snug text-gray-950 dark:text-white sm:text-2xl">
            {article.title}
          </h1>

          {/* Barre d'action rapide */}
          <div className="my-5 flex flex-wrap items-center gap-2.5 border-y border-gray-100 py-3 dark:border-neutral-800">
            <button
              type="button"
              onClick={handleVerify}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700"
            >
              <ShieldCheck size={16} />
              Vérifier avec l&apos;IA
            </button>

            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700"
              >
                <ExternalLink size={14} />
                Source originale
              </a>
            )}

            {"id" in article && article.id !== undefined && (
              <a
                href={`/actualites/${article.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200"
              >
                Page complète
                <ExternalLink size={13} />
              </a>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Lien copié</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Partager</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                hasLiked
                  ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300"
              }`}
            >
              <Heart size={14} className={hasLiked ? "fill-rose-600" : ""} />
              <span>{likes}</span>
            </button>
          </div>

          {/* Contenu et paragraphes */}
          <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {paragraphs.map((p, idx) => (
              <p key={idx} className={idx === 0 ? "font-medium text-gray-900 dark:text-gray-100" : ""}>
                {p}
              </p>
            ))}
          </div>

          {/* Section Commentaires */}
          <div className="mt-8 border-t border-gray-100 pt-6 dark:border-neutral-800">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-950 dark:text-white">
              <MessageCircle size={16} className="text-red-600" />
              Commentaires de la communauté ({comments.length})
            </h3>

            {/* Formulaire de nouveau commentaire */}
            <form onSubmit={handleAddComment} className="mb-5 flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Ajouter une précision ou commenter..."
                className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-40"
              >
                <Send size={13} />
                Publier
              </button>
            </form>

            {/* Liste des commentaires */}
            <div className="space-y-3">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-850"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {c.author}
                    </span>
                    <span className="text-[11px] text-gray-400">{c.date}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

