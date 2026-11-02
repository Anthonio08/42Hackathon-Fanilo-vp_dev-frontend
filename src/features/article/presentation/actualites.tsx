"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { articleRepository } from "../repository/article.repository";
import type { ArticleItem } from "../domain/article.entity";
import { ArticleCard } from "@/shared/ui/article_card";

const ITEMS_PER_PAGE = 6;

const STATUS_FILTERS = [
  { id: "all", label: "Tous", icon: null },
  { id: "verified", label: "Vérifiés", icon: CheckCircle2, color: "text-emerald-600" },
  { id: "fake", label: "Fake News", icon: AlertOctagon, color: "text-red-600" },
  { id: "unverified", label: "Non vérifiés", icon: AlertTriangle, color: "text-amber-500" },
  { id: "pending", label: "En cours", icon: Clock, color: "text-slate-500" },
];

const CATEGORIES = [
  "Tous",
  "Sécurité",
  "Transport",
  "Météo",
  "Événement",
  "Santé",
  "Autres",
];

export default function Actualites() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string>("Tous");
  const [activeStatus, setActiveStatus] = useState<string>("all");

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await articleRepository.getAll();
      setArticles(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des articles :", err);
      setError("Impossible de charger les actualités pour le moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    articleRepository
      .getAll()
      .then((data) => {
        if (!isCancelled) {
          setArticles(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("Erreur lors de la récupération des articles :", err);
          setError("Impossible de charger les actualités pour le moment.");
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    setPage(1);
  };

  // Compteurs de vérification
  const stats = useMemo(() => {
    const verified = articles.filter(
      (a) => a.status?.toLowerCase() === "verified"
    ).length;
    const fake = articles.filter(
      (a) => a.status?.toLowerCase() === "fake"
    ).length;
    const unverified = articles.filter(
      (a) =>
        a.status?.toLowerCase() === "unverified" ||
        a.status?.toLowerCase() === "pending"
    ).length;
    return { verified, fake, unverified, total: articles.length };
  }, [articles]);

  // Filtrage combiné par Catégorie et par Statut de vérification
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      // Filtre catégorie
      const matchesCategory =
        activeCategory === "Tous" ||
        (a.category || a.source || "").toLowerCase() ===
          activeCategory.toLowerCase();

      // Filtre statut
      const currentStatus = (a.status || "pending").toLowerCase();
      const matchesStatus =
        activeStatus === "all" || currentStatus === activeStatus.toLowerCase();

      return matchesCategory && matchesStatus;
    });
  }, [articles, activeCategory, activeStatus]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <main className="w-full pb-16 pt-8">
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="relative inline-block pb-1 text-2xl font-extrabold text-gray-950 dark:text-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:border-b-2 after:border-red-600">
              Journaux &amp; Veille d&apos;Information
            </h2>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Vérification des faits, détection des fake news et actualités certifiées.
            </p>
          </div>

          <button
            type="button"
            onClick={loadArticles}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300 sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-red-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* État de chargement */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="aspect-video w-full animate-pulse bg-gray-200 dark:bg-neutral-800" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                  <div className="h-5 w-full animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* État d'erreur */}
        {!loading && error && (
          <div className="my-8 rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-950 dark:bg-red-950/20">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              type="button"
              onClick={loadArticles}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-700"
            >
              <RefreshCw size={14} />
              Réessayer
            </button>
          </div>
        )}

        {/* Liste des articles avec badges */}
        {!loading && !error && paginated.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((article, index) => (
              <ArticleCard
                article={article}
                key={article.id ?? `${article.title}-${index}`}
              />
            ))}
          </div>
        )}

        {/* Aucun résultat */}
        {!loading && !error && filteredArticles.length === 0 && (
          <div className="my-14 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-neutral-800">
            <AlertTriangle className="mx-auto mb-2 text-gray-400" size={28} />
            Aucun article ne correspond aux filtres sélectionnés.
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-neutral-800 dark:text-gray-300"
            >
              <ChevronLeft size={16} />
              Précédent
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePageChange(p)}
                className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                  p === page
                    ? "bg-red-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-800"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-neutral-800 dark:text-gray-300"
            >
              Suivant
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
