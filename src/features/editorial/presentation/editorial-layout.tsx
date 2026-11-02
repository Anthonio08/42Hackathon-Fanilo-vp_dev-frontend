/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { editorialRepository } from "../repository/editorial.repository";
import type {
  EditorialArticle,
  EditorialCategory,
  EditorialStatus,
  EditorialRating,
} from "../domain/editorial.entity";

/* ─────────────── Catégories et Libellés sobres ─────────────── */

const CATEGORIES: { id: EditorialCategory | "all"; label: string }[] = [
  { id: "all", label: "Tous les articles" },
  { id: "politique", label: "Politique" },
  { id: "societe", label: "Société" },
  { id: "economie", label: "Économie" },
  { id: "environnement", label: "Environnement" },
  { id: "sante", label: "Santé" },
  { id: "international", label: "International" },
  { id: "science_tech", label: "Sciences & Médias" },
];

// Pistes d'enquête suivies par la rédaction (format humain, sans surcharge)
const INVESTIGATION_LEADS = [
  {
    topic: "Rumeurs institutionnelles et désinformation sur les réseaux sociaux",
    category: "politique" as EditorialCategory,
    angle: "Enquête sur la provenance des faux communiqués et l'impact sur l'opinion publique.",
  },
  {
    topic: "Réseau d'eau potable de Mandroseza : travaux réels et spéculations",
    category: "societe" as EditorialCategory,
    angle: "Vérification des capacités de distribution et point sur les quartiers les plus touchés.",
  },
  {
    topic: "Prévisions cycloniques 2026 : canaux d'alerte officiels contre infox virales",
    category: "environnement" as EditorialCategory,
    angle: "Recoupement entre les données de Météo Madagascar et les rumeurs sur les messageries.",
  },
  {
    topic: "Approvisionnement en riz : stocks de régulation et réalité des marchés",
    category: "economie" as EditorialCategory,
    angle: "Relevé des prix sur les étals d'Analakely, d'Isotry et d'Anosibe.",
  },
];

function formatVerdictText(rating?: string | null): string | null {
  if (!rating) return null;
  switch (rating.toLowerCase()) {
    case "true":
    case "mostly_true":
      return "Fait confirmé";
    case "false":
      return "Information fausse";
    case "misleading":
      return "Contexte trompeur";
    case "half_true":
      return "Partiellement vrai";
    default:
      return "Enquête en cours";
  }
}

function formatDateHuman(dateStr: string | null): string {
  if (!dateStr) return "Récemment";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function EditorialLayout() {
  const [articles, setArticles] = useState<EditorialArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState<EditorialCategory | "all">("all");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [, startTransition] = useTransition();

  // Assistant d'écriture (discret, repliable)
  const [showDraftAssistant, setShowDraftAssistant] = useState(false);
  const [draftTopic, setDraftTopic] = useState("");
  const [draftCategory, setDraftCategory] = useState<EditorialCategory>("general");
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);

  // Modal rédaction manuelle
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newClaim, setNewClaim] = useState("");
  const [newRating, setNewRating] = useState<EditorialRating>("unproven");
  const [newCategory, setNewCategory] = useState<EditorialCategory>("general");
  const [newImageUrl, setNewImageUrl] = useState("");

  /* ── Chargement des articles ── */
  const loadArticles = async (
    p = page,
    cat = activeCategory,
    stat = activeStatus,
    query = searchQuery
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: p,
        per_page: 9,
        ...(cat !== "all" ? { category: cat } : {}),
        ...(stat !== "all" ? { status: stat as EditorialStatus } : {}),
        ...(query.trim() ? { search: query.trim() } : {}),
      };

      const response = await editorialRepository.listAll(params);
      startTransition(() => {
        setArticles(response.articles);
        setTotalPages(Math.max(1, Math.ceil(response.total / response.per_page)));
      });
    } catch {
      setError("Impossible d'actualiser les articles pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    editorialRepository
      .listAll({ page: 1, per_page: 9 })
      .then((res) => {
        if (!cancelled) {
          startTransition(() => {
            setArticles(res.articles);
            setTotalPages(Math.max(1, Math.ceil(res.total / res.per_page)));
          });
        }
      })
      .catch(() => {
        if (!cancelled) setError("Articles temporairement indisponibles.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCategoryChange = (cat: EditorialCategory | "all") => {
    setActiveCategory(cat);
    setPage(1);
    loadArticles(1, cat, activeStatus, searchQuery);
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    setPage(1);
    loadArticles(1, activeCategory, status, searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadArticles(1, activeCategory, activeStatus, searchQuery);
  };

  // Reprendre une piste de la rédaction dans l'assistant
  const handleSelectLead = (lead: (typeof INVESTIGATION_LEADS)[0]) => {
    setDraftTopic(lead.topic);
    setDraftCategory(lead.category);
    setShowDraftAssistant(true);
    setGenerateMessage(null);
  };

  // Génération assistée
  const handleGenerateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTopic.trim() || generating) return;

    setGenerating(true);
    setGenerateMessage(null);

    try {
      const created = await editorialRepository.generateDraft({
        topic: draftTopic.trim(),
        category: draftCategory,
      });

      startTransition(() => {
        setArticles((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
        setDraftTopic("");
        setGenerateMessage(`L'ébauche « ${created.title} » a été créée avec succès.`);
      });
    } catch {
      setGenerateMessage("Erreur lors de la préparation de l'ébauche.");
    } finally {
      setGenerating(false);
    }
  };

  // Création manuelle
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || creating) return;

    setCreating(true);
    try {
      const created = await editorialRepository.createArticle({
        title: newTitle.trim(),
        summary: newSummary.trim() || newTitle.trim(),
        content: newContent.trim(),
        fact_check_claim: newClaim.trim() || undefined,
        editorial_rating: newRating,
        category: newCategory,
        featured_image_url: newImageUrl.trim() || undefined,
        is_featured: false,
      });

      startTransition(() => {
        setArticles((prev) => [created, ...prev]);
        setIsCreateModalOpen(false);
        setNewTitle("");
        setNewSummary("");
        setNewContent("");
        setNewClaim("");
        setNewImageUrl("");
      });
    } catch {
      // Ignorer
    } finally {
      setCreating(false);
    }
  };

  // Sélection du grand format "À la une"
  const featuredArticle = articles.find((a) => a.is_featured) || articles[0];
  const regularArticles = articles.filter((a) => a.id !== featuredArticle?.id);

  return (
    <main className="w-full pb-20 pt-10 text-neutral-900 dark:text-neutral-100">
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* ── En-tête journalistique épuré ── */}
        <header className="border-b border-neutral-200 pb-8 dark:border-neutral-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-red-600">
                La Rédaction &middot; Enquêtes &amp; Décryptages
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
                Espace Éditorial
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Analyses approfondies, vérification des déclarations publiques et travail de fond des journalistes sur les grands enjeux malgaches.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDraftAssistant(!showDraftAssistant)}
                className="rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
              >
                {showDraftAssistant ? "Masquer l'aide" : "Aide à la rédaction"}
              </button>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                <Plus size={14} />
                Nouvel article
              </button>
            </div>
          </div>
        </header>

        {/* ── Assistant d'écriture discret (Repliable) ── */}
        {showDraftAssistant && (
          <section className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50/80 p-5 dark:border-neutral-800 dark:bg-neutral-900/60">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Préparer une ébauche d&apos;article
                </h3>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  Saisissez un sujet ou une déclaration pour générer une structure d&apos;enquête et un plan de vérification.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDraftAssistant(false)}
                className="text-neutral-400 hover:text-neutral-600"
                aria-label="Fermer l'aide"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleGenerateDraft} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={draftTopic}
                onChange={(e) => setDraftTopic(e.target.value)}
                placeholder="Ex : Flambée des prix du riz, alerte cyclone Toamasina, rumeurs électorales…"
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 outline-none transition focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <select
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value as EditorialCategory)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:w-44"
              >
                {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={generating || !draftTopic.trim()}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {generating ? "Rédaction en cours…" : "Générer l'ébauche"}
              </button>
            </form>

            {generateMessage && (
              <p className="mt-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {generateMessage}
              </p>
            )}
          </section>
        )}

        {/* ── Pistes de travail de la rédaction (Inspirations sobres) ── */}
        <section className="mt-8 border-b border-neutral-200 pb-8 dark:border-neutral-800">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Pistes d&apos;investigation en cours
            </h2>
            <span className="text-xs text-neutral-400">
              Sujets identifiés par la rédaction
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INVESTIGATION_LEADS.map((lead, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectLead(lead)}
                className="group flex cursor-pointer flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                    {lead.category}
                  </span>
                  <h3 className="mt-1 text-xs font-semibold text-neutral-900 group-hover:text-red-600 dark:text-neutral-100">
                    {lead.topic}
                  </h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {lead.angle}
                  </p>
                </div>
                <span className="mt-3 text-[11px] font-medium text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200">
                  Développer ce sujet &rarr;
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Barre de Filtres & Recherche sobre ── */}
        <nav aria-label="Filtres thématiques" className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Liens de catégories typographiques */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-neutral-200 pb-3 dark:border-neutral-800 md:border-b-0 md:pb-0">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`text-xs transition ${
                    isActive
                      ? "font-bold text-neutral-950 underline decoration-red-600 decoration-2 underline-offset-8 dark:text-white"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Recherche sobre */}
          <div className="flex items-center gap-3">
            {/* Statuts discrets */}
            <select
              value={activeStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-700 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="in_review">En relecture</option>
              <option value="draft">Brouillons</option>
            </select>

            <form onSubmit={handleSearchSubmit} className="relative w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher…"
                className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 pl-8 pr-3 text-xs text-neutral-900 outline-none transition focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-neutral-400" />
            </form>
          </div>
        </nav>

        {/* ── États de chargement et d'erreur ── */}
        {loading && (
          <div className="my-16 flex flex-col items-center justify-center gap-2 text-center text-xs text-neutral-400">
            <RefreshCw size={18} className="animate-spin text-neutral-600" />
            <span>Chargement des articles de la rédaction…</span>
          </div>
        )}

        {error && !loading && (
          <div className="my-12 rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => loadArticles(page, activeCategory, activeStatus, searchQuery)}
              className="mt-3 text-xs font-semibold text-red-600 underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* ── Contenu Principal des Articles ── */}
        {!loading && !error && articles.length > 0 && (
          <div className="mt-10 space-y-12">
            {/* ── Grand Format / À la une ── */}
            {featuredArticle && (
              <article className="group grid gap-6 border-b border-neutral-200 pb-12 dark:border-neutral-800 md:grid-cols-12 md:items-center">
                <div className="md:col-span-7">
                  {featuredArticle.featured_image_url ? (
                    <Link href={`/blog/${featuredArticle.slug || featuredArticle.id}`} className="block overflow-hidden rounded-xl">
                      <img
                        src={featuredArticle.featured_image_url}
                        alt={featuredArticle.title}
                        className="h-80 w-full object-cover transition duration-300 group-hover:scale-102"
                      />
                    </Link>
                  ) : (
                    <div className="h-80 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                  )}
                </div>

                <div className="flex flex-col justify-center md:col-span-5">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="font-bold uppercase tracking-wider text-red-600">
                      {featuredArticle.category}
                    </span>
                    <span>&middot;</span>
                    <span>{formatDateHuman(featuredArticle.published_at || featuredArticle.created_at)}</span>
                  </div>

                  <h2 className="mt-3 text-2xl font-bold leading-tight text-neutral-950 group-hover:text-red-600 dark:text-white sm:text-3xl">
                    <Link href={`/blog/${featuredArticle.slug || featuredArticle.id}`}>
                      {featuredArticle.title}
                    </Link>
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 line-clamp-3">
                    {featuredArticle.summary}
                  </p>

                  {/* Note fact-checking sobre */}
                  {featuredArticle.fact_check_claim && (
                    <div className="mt-4 border-l-2 border-neutral-300 pl-3 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                        {formatVerdictText(featuredArticle.editorial_rating)} :
                      </span>{" "}
                      &laquo; {featuredArticle.fact_check_claim} &raquo;
                    </div>
                  )}

                  <div className="mt-6 flex items-center gap-4 text-xs">
                    <Link
                      href={`/blog/${featuredArticle.slug || featuredArticle.id}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-neutral-950 underline underline-offset-4 dark:text-white hover:text-red-600"
                    >
                      Lire l&apos;enquête complète
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {/* ── Grille d'articles journalistiques (2 colonnes élégantes) ── */}
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {regularArticles.map((article) => {
                const verdict = formatVerdictText(article.editorial_rating);

                return (
                  <article key={article.id} className="group flex flex-col justify-between">
                    <div>
                      {article.featured_image_url && (
                        <Link href={`/blog/${article.slug || article.id}`} className="block overflow-hidden rounded-lg">
                          <img
                            src={article.featured_image_url}
                            alt={article.title}
                            className="h-48 w-full object-cover transition duration-200 group-hover:opacity-90"
                          />
                        </Link>
                      )}

                      <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-500">
                        <span className="font-semibold uppercase tracking-wider text-red-600">
                          {article.category}
                        </span>
                        <span>&middot;</span>
                        <span>{formatDateHuman(article.published_at || article.created_at)}</span>
                      </div>

                      <h3 className="mt-1.5 text-base font-bold leading-snug text-neutral-950 group-hover:text-red-600 dark:text-white">
                        <Link href={`/blog/${article.slug || article.id}`}>
                          {article.title}
                        </Link>
                      </h3>

                      <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 line-clamp-3">
                        {article.summary}
                      </p>

                      {verdict && (
                        <p className="mt-2 text-[11px] italic text-neutral-500">
                          {verdict}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-neutral-400">
                        {article.views_count > 0 ? `${article.views_count} lectures` : "Récent"}
                      </span>
                      <Link
                        href={`/blog/${article.slug || article.id}`}
                        className="font-medium text-neutral-900 hover:text-red-600 dark:text-neutral-200"
                      >
                        Lire &rarr;
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ── État vide ── */}
        {!loading && !error && articles.length === 0 && (
          <div className="my-20 text-center text-xs text-neutral-500">
            <p>Aucun article ne correspond à votre sélection.</p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory("all");
                setActiveStatus("all");
                setSearchQuery("");
                loadArticles(1, "all", "all", "");
              }}
              className="mt-2 text-red-600 underline font-medium"
            >
              Afficher tous les articles
            </button>
          </div>
        )}

        {/* ── Pagination sobre ── */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => {
                const prev = Math.max(1, page - 1);
                setPage(prev);
                loadArticles(prev, activeCategory, activeStatus, searchQuery);
              }}
              disabled={page === 1}
              className="text-neutral-600 disabled:opacity-40 hover:text-neutral-900 dark:text-neutral-400"
            >
              &larr; Page précédente
            </button>
            <span className="text-neutral-400">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => {
                const next = Math.min(totalPages, page + 1);
                setPage(next);
                loadArticles(next, activeCategory, activeStatus, searchQuery);
              }}
              disabled={page === totalPages}
              className="text-neutral-600 disabled:opacity-40 hover:text-neutral-900 dark:text-neutral-400"
            >
              Page suivante &rarr;
            </button>
          </div>
        )}
      </div>

      {/* ── Modal de Rédaction Manuelle sobre ── */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Rédiger un nouvel article
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Titre de l&apos;enquête *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Titre sobre et informatif…"
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2.5 outline-none transition focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Chapeau / Résumé
                </label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Synthèse introductive pour le lecteur…"
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2.5 outline-none transition focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Corps du texte *
                </label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Développement, recoupements, déclarations et sources vérifiées…"
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2.5 outline-none transition focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Catégorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EditorialCategory)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Verdict de vérification
                  </label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(e.target.value as EditorialRating)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="true">Fait vérifié</option>
                    <option value="mostly_true">Plutôt vrai</option>
                    <option value="half_true">Partiellement vrai</option>
                    <option value="misleading">Contexte trompeur</option>
                    <option value="false">Faux / Démenti</option>
                    <option value="unproven">En cours d&apos;examen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Affirmation vérifiée (le cas échéant)
                </label>
                <input
                  type="text"
                  value={newClaim}
                  onChange={(e) => setNewClaim(e.target.value)}
                  placeholder="Ex : Coupure générale d'eau potable annoncée pour 14 jours"
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2.5 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  URL de l&apos;image d&apos;illustration
                </label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/…"
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-2.5 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim() || !newContent.trim()}
                  className="rounded-lg bg-neutral-950 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950"
                >
                  {creating ? "Enregistrement…" : "Enregistrer l'article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
