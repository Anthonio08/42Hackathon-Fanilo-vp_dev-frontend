"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Heart,
  MessageCircle,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  ThumbsUp,
  User as UserIcon,
} from "lucide-react";
import { articleRepository } from "../repository/article.repository";
import type { ArticleItem } from "../domain/article.entity";
import { renderStatusBadge } from "@/shared/ui/article_card";
import { getEmbedUrl } from "@/shared/lib/embed";

interface CommentItem {
  id: number | string;
  author: string;
  time: string;
  text: string;
  likes: number;
}

interface ArticleDetailProps {
  id?: string | number;
  initialArticle?: ArticleItem;
}

export default function ArticleDetail({
  id: propId,
  initialArticle,
}: ArticleDetailProps) {
  const params = useParams();
  const router = useRouter();

  // Résolution de l'identifiant (passé par props ou extrait de l'URL)
  const articleId = propId ?? (params?.id as string | undefined);

  const [article, setArticle] = useState<ArticleItem | null>(
    initialArticle || null
  );
  const [loading, setLoading] = useState<boolean>(!initialArticle);
  const [error, setError] = useState<string | null>(null);
  const [similar, setSimilar] = useState<ArticleItem[]>([]);

  // États interactifs (commentaires, likes, partage)
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 1,
      author: "Rado T.",
      time: "Il y a 2 heures",
      text: "Merci pour ces informations claires et vérifiées.",
      likes: 12,
    },
    {
      id: 2,
      author: "Fanja M.",
      time: "Il y a 45 minutes",
      text: "La gendarmerie locale a également publié un communiqué officiel à ce sujet.",
      likes: 5,
    },
  ]);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState<number>(24);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"recent" | "likes">("recent");

  // Récupération de l'article par son ID
  useEffect(() => {
    if (!articleId) return;

    let cancelled = false;

    articleRepository
      .getById(articleId)
      .then((data) => {
        if (!cancelled) {
          if (data) {
            setArticle(data);
          } else {
            setError("Article introuvable.");
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Erreur lors de la récupération de l'article :", err);
          setError("Impossible de charger les détails de cet article.");
          setLoading(false);
        }
      });

    // Chargement d'articles similaires / récents
    articleRepository
      .getAll({ limit: 6 })
      .then((all) => {
        if (!cancelled) {
          const others = all.filter(
            (item) => String(item.id) !== String(articleId)
          );
          setSimilar(others.slice(0, 4));
        }
      })
      .catch(() => {
        // Ignorer les erreurs des articles similaires
      });

    return () => {
      cancelled = true;
    };
  }, [articleId]);

  const handleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handlePublishComment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;

    setComments([
      {
        id: Date.now(),
        author: "Vous (Citoyen)",
        time: "À l'instant",
        text: trimmed,
        likes: 0,
      },
      ...comments,
    ]);
    setNewComment("");
  };

  const handleLikeComment = (commentId: number | string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // Ignorer
    }
  };

  const handleVerifyClaim = () => {
    if (!article) return;
    router.push(`/verify?claim=${encodeURIComponent(article.title)}`);
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "likes") return b.likes - a.likes;
    return 0; // "recent" conserve l'ordre chronologique inverse
  });

  // État de chargement
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="h-80 w-full animate-pulse rounded-2xl bg-gray-200 dark:bg-neutral-800" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
            <div className="space-y-2 pt-4">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-6 w-36 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-neutral-800" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-neutral-800" />
          </div>
        </div>
      </div>
    );
  }

  // État d'erreur / Non trouvé
  if (error || !article) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-xl font-bold text-gray-950 dark:text-white">
          {error || "Article introuvable"}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          L&apos;article demandé n&apos;existe pas ou a été déplacé.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/actualites"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
          >
            <ArrowLeft size={14} />
            Retour aux actualités
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-800"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  const hasValidImage = Boolean(
    (article.image_url && article.image_url.trim()) ||
    (article.image && article.image.trim() && article.image !== "/login-hero.jpg")
  );
  const embedInfo = article.source_url ? getEmbedUrl(article.source_url) : null;
  const useIframe = !hasValidImage && Boolean(embedInfo);

  const imageSrc =
    article.image || article.image_url || "/login-hero.jpg";
  const category = article.category || article.source || "Actualité";
  const dateStr =
    article.date ||
    (article.published_at || article.created_at
      ? new Date(
          article.published_at || article.created_at
        ).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Récemment");

  const authorName =
    article.author ||
    (article.source ? `Source : ${article.source}` : "Rédaction IFM");

  const paragraphs: string[] =
    article.paragraphs && article.paragraphs.length > 0
      ? article.paragraphs
      : article.content
      ? article.content.split("\n\n").filter(Boolean)
      : [article.description || article.title];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Fil d'Ariane (Breadcrumb) */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link href="/" className="hover:text-red-600 transition">
          Accueil
        </Link>
        <span>›</span>
        <Link href="/actualites" className="hover:text-red-600 transition">
          Actualités
        </Link>
        <span>›</span>
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {category}
        </span>
        <span>›</span>
        <span className="max-w-[280px] truncate text-gray-400 sm:max-w-md">
          {article.title}
        </span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        {/* Colonne Principale */}
        <article className="min-w-0">
          {/* Média : Iframe si pas d'image_url et qu'une source_url existe, sinon Image */}
          {useIframe && embedInfo ? (
            <div className="space-y-2">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm dark:border-neutral-800">
                <iframe
                  src={embedInfo.url}
                  title={article.title}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap items-center gap-2 z-10">
                  <span className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                    {category}
                  </span>
                  {article.source && (
                    <span className="rounded-lg bg-black/70 px-2.5 py-1 text-xs font-medium uppercase text-white backdrop-blur-sm">
                      {article.source}
                    </span>
                  )}
                </div>

                <div className="pointer-events-none absolute right-4 top-4 z-10">
                  {renderStatusBadge(article.status)}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                <span className="flex items-center gap-1.5">
                  Contenu intégré depuis : <span className="font-semibold text-gray-700 dark:text-gray-200 uppercase">{article.source || embedInfo.type}</span>
                </span>
                {article.source_url && (
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-red-600 hover:underline font-medium"
                  >
                    Ouvrir la publication originale
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm dark:bg-neutral-800">
              <Image
                src={imageSrc}
                alt={article.title}
                fill
                priority
                unoptimized={
                  typeof imageSrc === "string" && imageSrc.startsWith("http")
                }
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover"
              />
              <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2 z-10">
                <span className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  {category}
                </span>
                {article.source && (
                  <span className="rounded-lg bg-black/70 px-2.5 py-1 text-xs font-medium uppercase text-white backdrop-blur-sm">
                    {article.source}
                  </span>
                )}
              </div>

              <div className="absolute right-4 top-4 z-10">
                {renderStatusBadge(article.status)}
              </div>
            </div>
          )}

          {/* Titre de l'article */}
          <h1 className="mt-6 text-2xl font-extrabold leading-tight text-gray-950 dark:text-white sm:text-3xl">
            {article.title}
          </h1>

          {/* Métadonnées & Réseaux */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5 text-xs text-gray-500 dark:border-neutral-800 dark:text-gray-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                <UserIcon size={14} className="text-red-600" />
                {authorName}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} />
                {dateStr}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                Lecture ~ 3 min
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle size={14} />
                {comments.length} commentaires
              </span>
            </div>

            {/* Boutons d'action rapide */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLike}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  hasLiked
                    ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300"
                }`}
              >
                <Heart size={14} className={hasLiked ? "fill-rose-600" : ""} />
                <span>{likes}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-600">Copié</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span>Partager</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bandeau d'actions IA & Source */}
          <div className="my-6 flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
            <button
              type="button"
              onClick={handleVerifyClaim}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-red-700"
            >
              <ShieldCheck size={16} />
              Vérifier cette affirmation avec l&apos;IA
            </button>

            {article.source_url && (
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200"
              >
                <ExternalLink size={14} />
                Consulter la publication source
              </a>
            )}
          </div>

          {/* Contenu et paragraphes */}
          <div className="space-y-4 text-sm leading-relaxed text-gray-800 dark:text-gray-200 sm:text-base sm:leading-8">
            {paragraphs.map((p, idx) => (
              <p
                key={idx}
                className={
                  idx === 0
                    ? "font-medium text-gray-950 dark:text-white first-letter:float-left first-letter:mr-3 first-letter:text-4xl first-letter:font-black first-letter:text-red-600"
                    : ""
                }
              >
                {p}
              </p>
            ))}
          </div>

          {/* Espace Commentaires Interactif */}
          <section className="mt-12 border-t border-gray-100 pt-8 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-950 dark:text-white">
                Commentaires de la communauté ({comments.length})
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Trier par :</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "recent" | "likes")
                  }
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 outline-none dark:border-neutral-700 dark:bg-neutral-850 dark:text-gray-300"
                >
                  <option value="recent">Plus récents</option>
                  <option value="likes">Plus aimés</option>
                </select>
              </div>
            </div>

            {/* Formulaire d'ajout de commentaire */}
            <form onSubmit={handlePublishComment} className="mt-6 flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600 dark:bg-red-950/60 dark:text-red-400">
                V
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Apporter une précision, un témoignage ou votre avis..."
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs text-gray-900 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white sm:text-sm"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-40"
                  >
                    <Send size={13} />
                    Publier le commentaire
                  </button>
                </div>
              </div>
            </form>

            {/* Liste des commentaires */}
            <ul className="mt-6 space-y-3">
              {sortedComments.map((c) => (
                <li
                  key={c.id}
                  className="flex gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700 dark:bg-neutral-800 dark:text-gray-300">
                    {c.author[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {c.author}
                      </span>
                      <span className="text-[11px] text-gray-400">{c.time}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-700 dark:text-gray-300 sm:text-sm">
                      {c.text}
                    </p>
                    <div className="mt-2.5 flex items-center gap-4 text-xs text-gray-500">
                      <button
                        type="button"
                        onClick={() => handleLikeComment(c.id)}
                        className="inline-flex items-center gap-1 font-semibold text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <ThumbsUp size={12} />
                        <span>{c.likes}</span>
                      </button>
                      <button
                        type="button"
                        className="hover:text-red-600 dark:hover:text-red-400"
                      >
                        Répondre
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </article>

        {/* Colonne Latérale (Sidebar) */}
        <aside className="space-y-6">
          {/* Encart Fact-Checking IA */}
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 shadow-xs dark:border-red-950/40 dark:bg-red-950/20">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldCheck size={20} />
              <h3 className="font-bold text-sm">Vérification des faits</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              Un doute sur cette information ? Notre IA analyse le web et les
              réseaux sociaux en temps réel pour croiser les sources et détecter
              les intox.
            </p>
            <button
              type="button"
              onClick={handleVerifyClaim}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
            >
              Analyser cette information
            </button>
          </div>

          {/* Articles similaires */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 text-sm font-bold text-gray-950 dark:text-white">
              Articles similaires
            </h2>

            {similar.length === 0 ? (
              <p className="text-xs text-gray-400">
                Aucun article similaire pour le moment.
              </p>
            ) : (
              <ul className="space-y-3.5">
                {similar.map((sim) => {
                  const simImg =
                    sim.image || sim.image_url || "/login-hero.jpg";
                  return (
                    <li key={sim.id}>
                      <Link
                        href={`/actualites/${sim.id}`}
                        className="group flex gap-3 rounded-lg p-1.5 transition hover:bg-gray-50 dark:hover:bg-neutral-850"
                      >
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-neutral-800">
                          <Image
                            src={simImg}
                            alt={sim.title}
                            fill
                            unoptimized={
                              typeof simImg === "string" &&
                              simImg.startsWith("http")
                            }
                            className="object-cover transition group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs font-semibold leading-snug text-gray-900 transition group-hover:text-red-600 dark:text-white dark:group-hover:text-red-400">
                            {sim.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
                            <span>{sim.category || sim.source}</span>
                            <span>•</span>
                            <span>{sim.date || "Récemment"}</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Raccourci vers la carte des incidents */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <CheckCircle2 size={18} className="text-red-600" />
              <h3 className="font-bold text-sm">Zone sous surveillance</h3>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Consultez la carte interactive pour localiser les alertes et
              incidents signalés en temps réel.
            </p>
            <Link
              href="/carte"
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800"
            >
              Ouvrir la carte interactive
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
