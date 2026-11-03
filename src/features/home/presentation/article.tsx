"use client";

import { useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import type { ArticleItem } from "@/features/article/domain/article.entity";
import { articles as defaultArticles } from "../infrastructure/data";
import { ArticleCard } from "@/shared/ui/article_card";

const ITEMS_PER_PAGE = 6;

interface ArticleProps {
  active: string;
  articles?: ArticleItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onSelectArticle?: (article: ArticleItem) => void;
}

export function Article({
  active,
  articles: propArticles,
  loading = false,
  onRefresh,
  onSelectArticle,
}: ArticleProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Ajustement de la page quand la catégorie ou les articles changent (pattern React sans useEffect)
  const [prevActive, setPrevActive] = useState(active);
  const [prevArticles, setPrevArticles] = useState(propArticles);
  if (prevActive !== active || prevArticles !== propArticles) {
    setPrevActive(active);
    setPrevArticles(propArticles);
    setPage(1);
  }

  // Filtre strict : n'afficher QUE les articles disposant d'une image valide
  const sourceArticles = useMemo(() => {
    const list =
      propArticles && propArticles.length > 0 ? propArticles : defaultArticles;
    return list.filter((a) => {
      const img =
        ("image_url" in a && a.image_url ? a.image_url : null) ||
        ("image" in a && a.image ? a.image : null);
      return Boolean(img && img.trim() !== "");
    });
  }, [propArticles]);

  // Filtrage combiné Catégorie + Recherche
  const filtered = useMemo(() => {
    return sourceArticles.filter((a) => {
      // Filtre catégorie
      const catMatches =
        active === "Tous" ||
        (a.category || ("source" in a && (a as { source?: string }).source) || "")
          .toLowerCase() === active.toLowerCase();

      // Filtre recherche textuelle
      const q = searchQuery.trim().toLowerCase();
      const searchMatches =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        ("content" in a &&
          typeof a.content === "string" &&
          a.content.toLowerCase().includes(q));

      return catMatches && searchMatches;
    });
  }, [sourceArticles, active, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, safePage]);

  const handlePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setPage(1);
  };

  return (
    <section ref={sectionRef} className="mt-10">
      {/* En-tête de section avec Recherche et Actualisation */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="relative inline-block pb-1 text-lg font-bold text-gray-950 dark:text-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-15 after:border-b-2 after:border-red-600">
            Dernières actualités
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {filtered.length} {filtered.length > 1 ? "articles trouvés" : "article trouvé"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Champ de recherche rapide */}
          <div className="relative min-w-[200px] flex-1 sm:w-60 sm:flex-initial">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Rechercher une actu..."
              className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-7 text-xs text-gray-800 outline-none transition focus:border-red-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              title="Actualiser les actualités"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          )}
        </div>
      </div>

      {/* Grille d'articles ou Squelettes de chargement */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
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
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((article, index) => (
            <ArticleCard
              article={article}
              onClick={() => onSelectArticle?.(article as ArticleItem)}
              key={
                "id" in article && article.id
                  ? article.id
                  : `${article.title}-${index}`
              }
            />
          ))}
        </div>
      )}

      {/* État vide */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 p-10 text-center dark:border-neutral-800">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Aucun article ne correspond à votre recherche.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Essayez de modifier vos filtres ou de réinitialiser la recherche.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handlePage(safePage - 1)}
            disabled={safePage === 1}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-neutral-800 dark:text-gray-300"
          >
            <ChevronLeft size={15} />
            Précédent
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePage(p)}
              className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                p === safePage
                  ? "bg-red-600 text-white shadow-xs"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-neutral-800 dark:text-gray-300"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => handlePage(safePage + 1)}
            disabled={safePage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-neutral-800 dark:text-gray-300"
          >
            Suivant
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </section>
  );
}
