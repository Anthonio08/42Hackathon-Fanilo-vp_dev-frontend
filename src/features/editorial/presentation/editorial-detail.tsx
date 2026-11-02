/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Share2,
} from "lucide-react";
import { editorialRepository } from "../repository/editorial.repository";
import type { EditorialArticle, EditorialReview } from "../domain/editorial.entity";
import { authStorage } from "@/core/api.client";

/* ------------------------------------------------------------------ */
/*  Helpers & Formats sobres                                          */
/* ------------------------------------------------------------------ */

function formatDateHuman(iso: string | null): string {
  if (!iso) return "Récemment";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function readingTime(content: string): number {
  return Math.max(1, Math.round(content.length / 1000));
}

function getVerdictNote(rating?: string | null): { label: string; text: string } | null {
  if (!rating) return null;
  switch (rating.toLowerCase()) {
    case "true":
    case "mostly_true":
      return { label: "Fait vérifié", text: "Les éléments recueillis par la rédaction corroborent cette déclaration." };
    case "false":
      return { label: "Démenti / Faux", text: "Cette information a été vérifiée et formellement démentie par les sources primaires." };
    case "misleading":
      return { label: "Trompeur / Hors contexte", text: "Cette déclaration présente des éléments réels détournés de leur contexte d'origine." };
    case "half_true":
      return { label: "Partiellement vrai", text: "Certains faits sont avérés, mais d'importantes nuances manquent au récit initial." };
    default:
      return { label: "Examen en cours", text: "Les vérifications se poursuivent auprès des autorités et des acteurs concernés." };
  }
}

export function EditorialDetailPage({ identifier }: { identifier: string }) {
  const router = useRouter();

  const [article, setArticle] = useState<EditorialArticle | null>(null);
  const [comments, setComments] = useState<EditorialReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Actions
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState("");

  // Commentaires
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const isAuthenticated = authStorage.isAuthenticated();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await editorialRepository.getArticle(identifier);
        if (!cancelled) {
          setArticle(data);
          try {
            const reviewsData = await editorialRepository.getComments(data.id);
            if (!cancelled) setComments(reviewsData);
          } catch {
            // Ignorer
          }
        }
      } catch {
        if (!cancelled) setError("Impossible de charger cet article.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [identifier]);

  async function handleAction(action: () => Promise<EditorialArticle>) {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const updated = await action();
      setArticle(updated);
      setActionMessage("Statut mis à jour avec succès.");
    } catch {
      setActionMessage("Une erreur est survenue lors du traitement.");
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
      setActionMessage("Impossible d'enregistrer la note.");
    } finally {
      setCommentLoading(false);
    }
  }

  /* ---- État de chargement ---- */
  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-center text-xs text-neutral-400">
        Chargement de l&apos;article…
      </main>
    );
  }

  /* ---- Erreur ---- */
  if (error || !article) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{error || "Article introuvable."}</p>
        <button
          type="button"
          onClick={() => router.push("/blog")}
          className="mt-4 text-xs font-semibold text-neutral-900 underline dark:text-white"
        >
          Retourner à l&apos;espace éditorial
        </button>
      </main>
    );
  }

  const verdictNote = getVerdictNote(article.editorial_rating);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 text-neutral-900 dark:text-neutral-100">
      {/* ── Lien retour discret ── */}
      <nav aria-label="Fil d'Ariane" className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeft size={13} />
          Retour aux articles
        </Link>
      </nav>

      {/* ── En-tête de l'article (Style grand quotidien) ── */}
      <header className="border-b border-neutral-200 pb-8 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600">
          <span>{article.category}</span>
          <span>&middot;</span>
          <span className="text-neutral-400 font-normal">
            {article.status === "draft" ? "Brouillon de travail" : "Enquête de la rédaction"}
          </span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
          {article.title}
        </h1>

        {article.summary && (
          <p className="mt-4 text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
            {article.summary}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-100 pt-4 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <div>
            <span>Par la rédaction</span>
            <span className="mx-2">&middot;</span>
            <time dateTime={article.published_at || article.created_at}>
              {formatDateHuman(article.published_at || article.created_at)}
            </time>
          </div>

          <div className="flex items-center gap-3">
            <span>{readingTime(article.content)} min de lecture</span>
            <span>&middot;</span>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(window.location.href);
                  setActionMessage("Lien copié dans le presse-papiers.");
                  setTimeout(() => setActionMessage(null), 3000);
                }
              }}
              className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
            >
              <Share2 size={13} />
              Partager
            </button>
          </div>
        </div>
      </header>

      {/* ── Image principale ── */}
      {article.featured_image_url && (
        <figure className="my-8">
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="w-full rounded-xl object-cover max-h-[460px]"
          />
        </figure>
      )}

      {/* ── Encadré de vérification (Sobre, typographique) ── */}
      {article.fact_check_claim && verdictNote && (
        <aside className="my-8 rounded-lg border-l-2 border-neutral-900 bg-neutral-50 p-4 text-xs dark:border-white dark:bg-neutral-900">
          <p className="font-bold text-neutral-950 dark:text-white">
            {verdictNote.label}
          </p>
          <p className="mt-1 text-neutral-700 dark:text-neutral-300">
            &laquo;&nbsp;{article.fact_check_claim}&nbsp;&raquo;
          </p>
          <p className="mt-1.5 text-neutral-500 dark:text-neutral-400 text-[11px]">
            {verdictNote.text}
          </p>
        </aside>
      )}

      {/* ── Texte de l'article ── */}
      <section className="my-10 space-y-5 text-base leading-relaxed text-neutral-800 dark:text-neutral-200">
        {article.content.split("\n\n").map((para, i) => (
          <p key={i}>
            {para}
          </p>
        ))}
      </section>

      {/* ── Actions de Rédaction (Réservé aux journalistes) ── */}
      {isAuthenticated && (
        <section className="my-10 rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            Gestion du statut de l&apos;article
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {article.status === "draft" && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAction(() => editorialRepository.submitArticle(article.id))}
                className="rounded-lg bg-neutral-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
              >
                Soumettre au comité de relecture
              </button>
            )}

            {article.status === "in_review" && (
              <div className="flex w-full flex-col gap-2">
                <input
                  type="text"
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Remarque ou correction demandée…"
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
                <div className="flex gap-2">
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
                    className="rounded-lg bg-neutral-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
                  >
                    Valider l&apos;article
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
                    className="rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
                  >
                    Demander des révisions
                  </button>
                </div>
              </div>
            )}

            {article.status === "approved" && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAction(() => editorialRepository.publishArticle(article.id))}
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Publier pour les lecteurs
              </button>
            )}

            {article.status === "published" && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAction(() => editorialRepository.archiveArticle(article.id))}
                className="rounded-lg border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400"
              >
                Archiver
              </button>
            )}
          </div>

          {actionMessage && (
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
              {actionMessage}
            </p>
          )}
        </section>
      )}

      {/* ── Notes de Rédaction et Commentaires ── */}
      <footer className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Notes de révision &amp; échanges ({comments.length})
        </h2>

        <div className="mt-4 space-y-3">
          {comments.map((rev) => (
            <div
              key={rev.id}
              className="border-b border-neutral-100 pb-3 text-xs dark:border-neutral-800"
            >
              <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                <span>Rédacteur #{rev.user_id}</span>
                <span>{formatDateHuman(rev.created_at)}</span>
              </div>
              <p className="mt-1 text-neutral-700 dark:text-neutral-300">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>

        {isAuthenticated && (
          <div className="mt-6">
            <textarea
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Ajouter une note éditoriale…"
              className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                disabled={commentLoading || !commentText.trim()}
                onClick={handleSubmitComment}
                className="rounded-lg bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950"
              >
                Ajouter la note
              </button>
            </div>
          </div>
        )}
      </footer>
    </article>
  );
}
