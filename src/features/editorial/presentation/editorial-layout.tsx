/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Clock,
  Edit3,
  Eye,
  FileText,
  Flame,
  Lightbulb,
  PenTool,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Wand2,
  X,
} from "lucide-react";
import { editorialRepository } from "../repository/editorial.repository";
import type {
  EditorialArticle,
  EditorialStats,
  EditorialCategory,
  EditorialStatus,
  EditorialRating,
} from "../domain/editorial.entity";
import { TitleComponent } from "@/features/article/presentation/actualites";

/* ─────────────── Constants ─────────────── */

const CATEGORIES: { id: EditorialCategory | "all"; label: string; icon: typeof Tag }[] = [
  { id: "all", label: "Tout", icon: Tag },
  { id: "politique", label: "Politique", icon: Tag },
  { id: "sante", label: "Santé", icon: Tag },
  { id: "economie", label: "Économie", icon: Tag },
  { id: "societe", label: "Société", icon: Tag },
  { id: "science_tech", label: "Science & Tech", icon: Tag },
  { id: "environnement", label: "Environnement", icon: Tag },
  { id: "international", label: "International", icon: Tag },
  { id: "general", label: "Général", icon: Tag },
];

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

const CATEGORY_COLORS: Record<string, string> = {
  politique: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
  sante: "bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300",
  economie: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  societe: "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300",
  science_tech: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300",
  environnement: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  international: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
  general: "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300",
};

// Tendances actuelles servant de source d'inspiration pour les journalistes
const TRENDING_INSPIRATIONS = [
  {
    topic: "Rumeurs électorales et faux communiqués sur les réseaux sociaux",
    category: "politique" as EditorialCategory,
    volume: "14.2k mentions",
    trend: "+45%",
    claim: "Coup d'état constitutionnel imminent",
    urgency: "Élevée",
    urgencyColor: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  },
  {
    topic: "Coupures d'eau et travaux sur le réseau Mandroseza à Antananarivo",
    category: "societe" as EditorialCategory,
    volume: "9.8k mentions",
    trend: "+32%",
    claim: "Coupure totale d'eau pendant 14 jours",
    urgency: "Moyenne",
    urgencyColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  },
  {
    topic: "Saison cyclonique 2026 : Fausses alertes météo virales sur WhatsApp",
    category: "environnement" as EditorialCategory,
    volume: "8.5k mentions",
    trend: "+80%",
    claim: "Cyclone catégorie 5 sur Toamasina",
    urgency: "Élevée",
    urgencyColor: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  },
  {
    topic: "Flambée des prix du riz importé et disponibilité des stocks régulateurs",
    category: "economie" as EditorialCategory,
    volume: "6.1k mentions",
    trend: "+18%",
    claim: "Sac de 50 kg à plus de 250 000 Ar",
    urgency: "Normale",
    urgencyColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  },
];

/* ─────────────── Component ─────────────── */

export function EditorialLayout() {
  const [articles, setArticles] = useState<EditorialArticle[]>([]);
  const [stats, setStats] = useState<EditorialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState<EditorialCategory | "all">("all");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [, startTransition] = useTransition();

  // AI Draft generator state
  const [draftTopic, setDraftTopic] = useState("");
  const [draftCategory, setDraftCategory] = useState<EditorialCategory>("general");
  const [generating, setGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<EditorialArticle | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Manual creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newClaim, setNewClaim] = useState("");
  const [newRating, setNewRating] = useState<EditorialRating>("unproven");
  const [newCategory, setNewCategory] = useState<EditorialCategory>("general");
  const [newTags, setNewTags] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newIsFeatured, setNewIsFeatured] = useState(false);

  /* ── Load articles ── */
  const loadArticles = async (
    p: number = page,
    cat: EditorialCategory | "all" = activeCategory,
    stat: string = activeStatus,
    query: string = searchQuery
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
    } catch (err) {
      console.warn("Erreur lors du chargement des articles éditoriaux :", err);
      setError("Impossible de charger les articles pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Load stats ── */
  const loadStats = async () => {
    try {
      const data = await editorialRepository.getStats();
      startTransition(() => setStats(data));
    } catch (err) {
      console.warn("Erreur lors du chargement des statistiques :", err);
    }
  };

  /* ── Initial load ── */
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const response = await editorialRepository.listAll({ page: 1, per_page: 9 });
        if (!cancelled) {
          startTransition(() => {
            setArticles(response.articles);
            setTotalPages(Math.max(1, Math.ceil(response.total / response.per_page)));
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Erreur lors du chargement initial :", err);
          setError("Impossible de charger les articles pour le moment.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Category change ── */
  const handleCategoryChange = (cat: EditorialCategory | "all") => {
    setActiveCategory(cat);
    setPage(1);
    loadArticles(1, cat, activeStatus, searchQuery);
  };

  /* ── Status change ── */
  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    setPage(1);
    loadArticles(1, activeCategory, status, searchQuery);
  };

  /* ── Search submit ── */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadArticles(1, activeCategory, activeStatus, searchQuery);
  };

  /* ── Pagination ── */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      loadArticles(newPage, activeCategory, activeStatus, searchQuery);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ── AI Draft generation ── */
  const handleGenerateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTopic.trim() || generating) return;

    setGenerating(true);
    setGenerateError(null);
    setGeneratedArticle(null);

    try {
      const article = await editorialRepository.generateDraft({
        topic: draftTopic.trim(),
        category: draftCategory,
      });
      startTransition(() => {
        setGeneratedArticle(article);
        setArticles((prev) => [article, ...prev.filter((a) => a.id !== article.id)]);
        setDraftTopic("");
      });
    } catch (err) {
      console.warn("Erreur lors de la génération du brouillon :", err);
      setGenerateError("Impossible de générer le brouillon. Veuillez réessayer.");
    } finally {
      setGenerating(false);
    }
  };

  /* ── Pick trend as inspiration ── */
  const handlePickTrend = (trend: (typeof TRENDING_INSPIRATIONS)[0]) => {
    setDraftTopic(trend.topic);
    setDraftCategory(trend.category);
    // Smooth scroll to draft generator
    const el = document.getElementById("ai-draft-generator");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* ── Manual article creation ── */
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
        tags: newTags.trim() || undefined,
        featured_image_url: newImageUrl.trim() || undefined,
        is_featured: newIsFeatured,
      });

      startTransition(() => {
        setArticles((prev) => [created, ...prev]);
        setIsCreateModalOpen(false);
        // Reset form
        setNewTitle("");
        setNewSummary("");
        setNewContent("");
        setNewClaim("");
        setNewTags("");
        setNewImageUrl("");
        setNewIsFeatured(false);
      });
    } catch (err) {
      console.error("Erreur création article éditorial :", err);
    } finally {
      setCreating(false);
    }
  };

  /* ── Format date ── */
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="w-full pb-16 pt-8">
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* ── En-tête ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TitleComponent
            title="Desk Éditorial &amp; Veille des Tendances"
            description="Source d&apos;inspiration en temps réel, recoupement des signaux faibles et rédaction assistée par IA pour les journalistes."
          />
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              <Plus size={15} />
              Rédiger un article
            </button>
            <button
              type="button"
              onClick={() => loadArticles(page, activeCategory, activeStatus, searchQuery)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Actualiser
            </button>
          </div>
        </div>

        {/* ── Tendances & Inspirations journalistiques (Nouveauté) ── */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-red-600 animate-pulse" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Tendances Brûlantes &amp; Signaux Faibles du Web
              </h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Détection automatique Google Trends &amp; Réseaux
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRENDING_INSPIRATIONS.map((trend, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-red-400 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        CATEGORY_COLORS[trend.category] || CATEGORY_COLORS.general
                      }`}
                    >
                      {trend.category}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${trend.urgencyColor}`}>
                      {trend.urgency}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold leading-snug text-gray-900 group-hover:text-red-600 dark:text-white">
                    {trend.topic}
                  </h3>

                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Rumeur :</span> &laquo; {trend.claim} &raquo;
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-neutral-800 text-[11px]">
                  <span className="font-semibold text-gray-500 dark:text-gray-400">
                    {trend.volume} <span className="text-emerald-600 font-bold">({trend.trend})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePickTrend(trend)}
                    className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700 transition"
                  >
                    <Wand2 size={12} />
                    Rédiger
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stats Dashboard ── */}
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Total Articles", value: stats.total_articles, icon: FileText, color: "text-red-600" },
              { label: "Brouillons", value: stats.drafts_count, icon: Edit3, color: "text-gray-500" },
              { label: "En relecture", value: stats.in_review_count, icon: Clock, color: "text-blue-600" },
              { label: "Publiés", value: stats.published_count, icon: BookOpen, color: "text-green-600" },
              { label: "Vues totales", value: stats.total_views, icon: Eye, color: "text-purple-600" },
              { label: "Approuvés", value: stats.approved_count, icon: Star, color: "text-amber-500" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <stat.icon size={20} className={stat.color} />
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                  {stat.value.toLocaleString("fr-FR")}
                </span>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── AI Draft Generator ── */}
        <div
          id="ai-draft-generator"
          className="mb-8 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50/40 via-white to-red-50/20 p-6 shadow-sm dark:border-red-950/60 dark:from-neutral-900 dark:via-neutral-900 dark:to-red-950/20"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
              <Wand2 size={18} className="text-red-600" />
              Générateur de Brouillon Assisté par IA
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Synthèse factuelle &amp; structure prête pour la relecture
            </span>
          </div>

          <form onSubmit={handleGenerateDraft} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={draftTopic}
                onChange={(e) => setDraftTopic(e.target.value)}
                placeholder="Ex : Flambée des prix du riz, alerte cyclone Toamasina, rumeurs électorales…"
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-red-950"
              />
              <select
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value as EditorialCategory)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-red-950 sm:w-48"
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
              >
                {generating ? (
                  <Sparkles size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                Générer avec l&apos;IA
              </button>
            </div>
          </form>

          {/* Loading state during generation */}
          {generating && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50/60 p-5 text-center dark:border-red-950/40 dark:bg-red-950/20">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300">
                <Sparkles size={20} className="animate-spin" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Génération assistée par IA en cours…
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Analyse du sujet, structuration du plan d&apos;enquête et recoupement des faits.
              </p>
            </div>
          )}

          {/* Success state */}
          {generatedArticle && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                  <PenTool size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    Brouillon généré avec succès !
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    &laquo; {generatedArticle.title} &raquo;
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                    {generatedArticle.summary}
                  </p>
                  <Link
                    href={`/blog/${generatedArticle.slug || generatedArticle.id}`}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                  >
                    Consulter &amp; Soumettre pour révision
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {generateError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
              {generateError}
            </div>
          )}
        </div>

        {/* ── Search & Desk Filters ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Status buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "Tous les statuts" },
              { id: "published", label: "Publiés" },
              { id: "in_review", label: "En relecture" },
              { id: "draft", label: "Brouillons" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleStatusChange(st.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeStatus === st.id
                    ? "bg-red-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un article…"
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-xs text-gray-900 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          </form>
        </div>

        {/* ── Main content area with grid + sidebar ── */}
        <div className="flex flex-col gap-8 xl:flex-row">
          {/* ── Left: Filters + Articles grid ── */}
          <div className="flex-1">
            {/* Category filter pills */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-medium transition ${
                      isActive
                        ? "bg-red-600 text-white shadow-sm"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-red-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="h-48 w-full animate-pulse bg-gray-200 dark:bg-neutral-800" />
                    <div className="space-y-3 p-5">
                      <div className="flex gap-2">
                        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800" />
                        <div className="h-5 w-14 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800" />
                      </div>
                      <div className="h-5 w-full animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="my-8 rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-950 dark:bg-red-950/20">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                <button
                  type="button"
                  onClick={() => loadArticles(page, activeCategory, activeStatus, searchQuery)}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-700"
                >
                  <RefreshCw size={14} />
                  Réessayer
                </button>
              </div>
            )}

            {/* Articles grid */}
            {!loading && !error && articles.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    {/* Featured image */}
                    {article.featured_image_url ? (
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={article.featured_image_url}
                          alt={article.title}
                          className="h-48 w-full object-cover rounded-t-xl transition duration-300 group-hover:scale-105"
                        />
                        {article.is_featured && (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold text-amber-950 shadow-sm">
                            <Star size={10} />
                            À la une
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
                        <BookOpen size={40} className="text-gray-300 dark:text-neutral-700" />
                        {article.is_featured && (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold text-amber-950 shadow-sm">
                            <Star size={10} />
                            À la une
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-5">
                      {/* Badges */}
                      <div className="mb-3 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            CATEGORY_COLORS[article.category] || CATEGORY_COLORS.general
                          }`}
                        >
                          {CATEGORIES.find((c) => c.id === article.category)?.label || article.category}
                        </span>

                        {article.editorial_rating && RATING_LABELS[article.editorial_rating] && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              RATING_LABELS[article.editorial_rating].color
                            }`}
                          >
                            {RATING_LABELS[article.editorial_rating].label}
                          </span>
                        )}

                        {STATUS_LABELS[article.status] && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              STATUS_LABELS[article.status].color
                            }`}
                          >
                            {STATUS_LABELS[article.status].label}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-red-600 dark:text-white">
                        {article.title}
                      </h3>

                      {/* Summary */}
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 line-clamp-3 dark:text-gray-400">
                        {article.summary}
                      </p>

                      {/* Footer */}
                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-neutral-800">
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <Eye size={12} />
                            {article.views_count.toLocaleString("fr-FR")}
                          </span>
                          <span>
                            {formatDate(article.published_at || article.created_at)}
                          </span>
                        </div>
                        <Link
                          href={`/blog/${article.slug || article.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 transition hover:text-red-700"
                        >
                          Lire
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && articles.length === 0 && (
              <div className="my-14 rounded-2xl border border-dashed border-gray-200 p-10 text-center dark:border-neutral-800">
                <Lightbulb className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Aucun article éditorial ne correspond à vos filtres.
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Essayez de modifier votre catégorie ou de réinitialiser la recherche.
                </p>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-neutral-800 dark:text-gray-300"
                >
                  Précédent
                </button>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Page {page} sur {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-neutral-800 dark:text-gray-300"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>

          {/* ── Right: Trending Topics & Breakdown Sidebar ── */}
          {stats && (
            <aside className="w-full shrink-0 xl:w-80">
              <div className="sticky top-24 space-y-6">
                {/* Category breakdown */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                    <TrendingUp size={16} className="text-red-600" />
                    Tendances par Catégorie
                  </h3>

                  <ul className="space-y-2.5">
                    {Object.entries(stats.category_breakdown).map(([cat, count]) => {
                      const catInfo = CATEGORIES.find((c) => c.id === cat);
                      const maxCount = Math.max(...Object.values(stats.category_breakdown), 1);
                      const percent = Math.round((count / maxCount) * 100);

                      return (
                        <li key={cat}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {catInfo?.label || cat}
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {count}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                            <div
                              className="h-full rounded-full bg-red-600 transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Rating breakdown */}
                {Object.keys(stats.rating_breakdown).length > 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                      <BarChart3 size={16} className="text-red-600" />
                      Répartition Fact-Checking
                    </h3>

                    <div className="space-y-2">
                      {Object.entries(stats.rating_breakdown).map(([rating, count]) => {
                        const ratingInfo = RATING_LABELS[rating];
                        if (!ratingInfo) return null;

                        return (
                          <div
                            key={rating}
                            className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
                          >
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ratingInfo.color}`}
                            >
                              {ratingInfo.label}
                            </span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ── Modal de Création Manuelle d'Article ── */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit3 size={18} className="text-red-600" />
                Rédiger un nouvel article éditorial
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-red-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Titre de l&apos;article *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex : Enquête sur la distribution d'eau à Mandroseza…"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Chapeau / Résumé
                </label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Bref résumé accrocheur pour les lecteurs…"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Corps de l&apos;article *
                </label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Rédigez ici le développement, les faits vérifiés, citations et sources…"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Catégorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EditorialCategory)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Verdict Fact-Checking
                  </label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(e.target.value as EditorialRating)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    {Object.entries(RATING_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Affirmation vérifiée (Optionnelle)
                </label>
                <input
                  type="text"
                  value={newClaim}
                  onChange={(e) => setNewClaim(e.target.value)}
                  placeholder="Ex : Coupure totale d'eau pendant 14 jours"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    URL de l&apos;image de couverture
                  </label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="eau, enquete, antananarivo"
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={newIsFeatured}
                  onChange={(e) => setNewIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="featured-check" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Mettre cet article &laquo; À la une &raquo;
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim() || !newContent.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  <Send size={14} />
                  {creating ? "Enregistrement…" : "Enregistrer le brouillon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
