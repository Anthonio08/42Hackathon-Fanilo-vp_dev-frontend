/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  MessageSquare,
  Send,
  Share2,
  Star,
  Tag,
  User,
} from "lucide-react";
import { editorialRepository } from "../repository/editorial.repository";
import type { EditorialArticle, EditorialReview } from "../domain/editorial.entity";
import { authStorage } from "@/core/api.client";

/* ------------------------------------------------------------------ */
/*  Label maps                                                         */
/* ------------------------------------------------------------------ */

const RATING_LABELS: Record<string, { label: string; color: string }> = {
  true: { label: "Vrai", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" },
  mostly_true: { label: "Plutôt vrai", color: "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300" },
  half_true: { label: "Mi-vrai", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300" },
  misleading: { label: "Trompeur", color: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300" },
  false: { label: "Faux", color: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" },
  unproven: { label: "Non prouvé", color: "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300" },
  satire: { label: "Satire", color: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300" },
  in_review: { label: "En relecture", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" },
  approved: { label: "Approuvé", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" },
  rejected: { label: "Rejeté", color: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" },
  published: { label: "Publié", color: "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300" },
  archived: { label: "Archivé", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
};

const CATEGORY_LABELS: Record<string, string> = {
  politique: "Politique",
  sante: "Santé",
  economie: "Économie",
  societe: "Société",
  science_tech: "Science & Tech",
  environnement: "Environnement",
  international: "International",
  general: "Général",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function readingTime(content: string): number {
  return Math.max(1, Math.round(content.length / 1000));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EditorialDetailPage({ identifier }: { identifier: string }) {
  const router = useRouter();

  const [article, setArticle] = useState<EditorialArticle | null>(null);
  const [comments, setComments] = useState<EditorialReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Review feedback
  const [reviewFeedback, setReviewFeedback] = useState("");

  // Comment form
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const isAuthenticated = authStorage.isAuthenticated();

  /* ---- Load article ---- */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await editorialRepository.getArticle(identifier);
        if (!cancelled) {
          setArticle(data);

          // Load comments
          try {
            const reviewsData = await editorialRepository.getComments(data.id);
            if (!cancelled) setComments(reviewsData);
          } catch {
            // Comments may not exist yet — ignore
          }
        }
      } catch {
        if (!cancelled) setError("Impossible de charger l\u2019article.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [identifier]);

  /* ---- Actions ---- */
  async function handleAction(action: () => Promise<EditorialArticle>) {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const updated = await action();
      setArticle(updated);
      setActionMessage({ type: "success", text: "Action effectuée avec succès." });
    } catch {
      setActionMessage({ type: "error", text: "Une erreur est survenue." });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSubmitComment() {
    if (!article || !commentText.trim()) return;
    setCommentLoading(true);
    try {
      const newComment = await editorialRepository.addComment(article.id, commentText.trim());
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch {
      setActionMessage({ type: "error", text: "Impossible d\u2019ajouter le commentaire." });
    } finally {
      setCommentLoading(false);
    }
  }

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-48 rounded bg-gray-200 dark:bg-neutral-800" />
          <div className="h-10 w-3/4 rounded bg-gray-200 dark:bg-neutral-800" />
          <div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-neutral-800" />
          <div className="h-96 w-full rounded-2xl bg-gray-200 dark:bg-neutral-800" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-neutral-800" />
            <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-neutral-800" />
            <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-neutral-800" />
          </div>
        </div>
      </section>
    );
  }

  /* ---- Error ---- */
  if (error || !article) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <p className="text-lg text-red-600">{error || "Article introuvable."}</p>
        <button
          type="button"
          onClick={() => router.push("/blog")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <ArrowLeft size={16} />
          Retour à l&apos;éditorial
        </button>
      </section>
    );
  }

  const ratingInfo = article.editorial_rating ? RATING_LABELS[article.editorial_rating] : null;
  const statusInfo = STATUS_LABELS[article.status] || STATUS_LABELS.draft;
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      {/* ── Breadcrumb ── */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/" className="transition hover:text-red-600">
          Accueil
        </Link>
        <span>/</span>
        <Link href="/blog" className="transition hover:text-red-600">
          Éditorial
        </Link>
        <span>/</span>
        <span className="truncate max-w-xs text-gray-800 dark:text-gray-200 font-medium">
          {article.title.length > 50 ? article.title.slice(0, 50) + "…" : article.title}
        </span>
      </nav>

      {/* ── Back button ── */}
      <button
        type="button"
        onClick={() => router.push("/blog")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-red-600 dark:text-gray-400"
      >
        <ArrowLeft size={16} />
        Retour aux articles
      </button>

      {/* ── Article Header ── */}
      <header className="mb-8">
        {/* Badges */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Category */}
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
            <Tag size={12} />
            {categoryLabel}
          </span>

          {/* Rating */}
          {ratingInfo && (
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${ratingInfo.color}`}>
              <CheckCircle2 size={12} />
              {ratingInfo.label}
            </span>
          )}

          {/* Status */}
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.color}`}>
            {statusInfo.label}
          </span>

          {/* Featured */}
          {article.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              <Star size={12} />
              À la une
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {article.title}
        </h1>

        {/* Summary */}
        {article.summary && (
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {article.summary}
          </p>
        )}

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1.5">
            <User size={14} />
            Auteur #{article.author_id}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {formatDate(article.published_at || article.created_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye size={14} />
            {article.views_count.toLocaleString("fr-FR")} vues
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} />
            {readingTime(article.content)} min de lecture
          </span>
        </div>
      </header>

      {/* ── Featured Image ── */}
      <div className="mb-10 overflow-hidden rounded-2xl">
        {article.featured_image_url ? (
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="h-96 w-full object-cover rounded-2xl"
          />
        ) : (
          <div className="flex h-96 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-900">
            <BookOpen size={64} className="text-gray-300 dark:text-neutral-700" />
          </div>
        )}
      </div>

      {/* ── Article Content ── */}
      <article className="mb-10 rounded-2xl border border-gray-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="space-y-4">
          {article.content.split("\n\n").map((paragraph, idx) => (
            <p
              key={idx}
              className="text-base leading-relaxed text-gray-800 dark:text-gray-200"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      {/* ── Fact-Check Claim ── */}
      {article.fact_check_claim && (
        <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Vérification de fait
            </h3>
          </div>
          <p className="text-base text-amber-900 dark:text-amber-200 leading-relaxed">
            &laquo;&nbsp;{article.fact_check_claim}&nbsp;&raquo;
          </p>
          {ratingInfo && (
            <div className="mt-4">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ${ratingInfo.color}`}>
                <CheckCircle2 size={14} />
                Verdict : {ratingInfo.label}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Action Buttons ── */}
      {isAuthenticated && (
        <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            <Edit3 size={16} />
            Actions éditoriales
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            {article.status === "draft" && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAction(() => editorialRepository.submitArticle(article.id))}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <Send size={14} />
                Soumettre en relecture
              </button>
            )}

            {article.status === "in_review" && (
              <>
                <div className="flex w-full items-center gap-3 mb-3">
                  <input
                    type="text"
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="Commentaire de relecture (optionnel)…"
                    className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    handleAction(() =>
                      editorialRepository.reviewArticle(article.id, {
                        decision: "approved",
                        feedback: reviewFeedback,
                      })
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CheckCircle2 size={14} />
                  Approuver
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    handleAction(() =>
                      editorialRepository.reviewArticle(article.id, {
                        decision: "rejected",
                        feedback: reviewFeedback,
                      })
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  Rejeter
                </button>
              </>
            )}

            {article.status === "approved" && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAction(() => editorialRepository.publishArticle(article.id))}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
              >
                <Send size={14} />
                Publier
              </button>
            )}

            {article.status === "published" && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAction(() => editorialRepository.archiveArticle(article.id))}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
              >
                Archiver
              </button>
            )}
          </div>

          {/* Action feedback */}
          {actionMessage && (
            <p
              className={`mt-3 text-sm font-medium ${
                actionMessage.type === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {actionMessage.text}
            </p>
          )}
        </div>
      )}

      {/* ── Comments / Review History ── */}
      <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          <MessageSquare size={16} />
          Commentaires &amp; historique ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucun commentaire pour le moment.
          </p>
        ) : (
          <ul className="space-y-4">
            {comments.map((review) => (
              <li
                key={review.id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50"
              >
                <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-200">
                    <User size={12} />
                    Utilisateur #{review.user_id}
                  </span>
                  {review.action && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {review.action}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(review.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* Add comment form */}
        {isAuthenticated && (
          <div className="mt-6 border-t border-gray-100 pt-6 dark:border-neutral-800">
            <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ajouter un commentaire
            </h4>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Votre commentaire…"
              rows={3}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                disabled={commentLoading || !commentText.trim()}
                onClick={handleSubmitComment}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                <Send size={14} />
                {commentLoading ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Share Buttons ── */}
      <div className="mb-10 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Partager :</span>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              navigator.clipboard.writeText(window.location.href);
              setActionMessage({ type: "success", text: "Lien copié !" });
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700"
        >
          <Share2 size={14} />
          Copier le lien
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700"
        >
          Twitter / X
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700"
        >
          Facebook
        </a>
      </div>
    </section>
  );
}
