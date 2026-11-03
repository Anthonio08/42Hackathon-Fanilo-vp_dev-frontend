"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  User as UserIcon,
  X,
} from "lucide-react";
import { authStorage } from "@/core/api.client";
import type { User } from "@/features/auth/domain/user.entity";
import { NewsDatasource } from "@/features/article/source/news.datasource";
import type { ArticleItem } from "@/features/article/domain/article.entity";
import { articles as localArticles } from "@/features/home/infrastructure/data";

const links = [
  { name: "Accueil", href: "/" },
  { name: "Journaux", href: "/actualites" },
  { name: "Vérifier", href: "/verify" },
  { name: "Carte", href: "/carte" },
  { name: "Éditorial", href: "/blog" },
];

function statusBadge(status?: string) {
  switch (status?.toLowerCase()) {
    case "verified":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 size={11} /> Vérifié
        </span>
      );
    case "fake":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
          <AlertTriangle size={11} /> Fake
        </span>
      );
    case "unverified":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          Non vérifié
        </span>
      );
    case "pending":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-neutral-800 dark:text-gray-300">
          En attente
        </span>
      );
  }
}

function toLocalResults(q: string): ArticleItem[] {
  const lowerQ = q.toLowerCase();
  return localArticles
    .filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQ) ||
        item.description.toLowerCase().includes(lowerQ)
    )
    .slice(0, 10)
    .map((item, idx) => ({
      id: idx + 1,
      title: item.title,
      content: item.description,
      source: item.category,
      source_url: "",
      author: null,
      image_url: item.image,
      status: "pending",
      collected_by_id: 1,
      published_at: item.date,
      collected_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [collectMessage, setCollectMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Recherche via l'endpoint GET /api/v1/news/search
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      const q = query.trim();
      if (q.length < 2) {
        if (!cancelled) {
          setResults([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
      }

      try {
        const response = await NewsDatasource.search(q, 1, 15);
        if (!cancelled) {
          if (response && Array.isArray(response.articles) && response.articles.length > 0) {
            setResults(response.articles);
          } else {
            setResults(toLocalResults(q));
          }
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Erreur recherche API news, fallback local:", err);
          setResults(toLocalResults(q));
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Déclenchement de la collecte en temps réel : POST /api/v1/news/collect
  const handleCollect = async () => {
    const q = query.trim();
    if (!q) return;

    setCollecting(true);
    setCollectMessage(null);

    try {
      const res = await NewsDatasource.collect({
        query: q,
        num_results: 10,
        source: "all",
      });

      startTransition(() => {
        if (res && Array.isArray(res.articles)) {
          setResults((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            return [...res.articles.filter((a) => !existingIds.has(a.id)), ...prev];
          });
          setCollectMessage(
            `${res.collected_count} article(s) collecté(s) depuis Google et Facebook !`
          );
        } else {
          setCollectMessage("Collecte terminée.");
        }
      });
    } catch (err) {
      console.error("Erreur lors de la collecte de news :", err);
      setCollectMessage("Impossible de collecter les news pour le moment.");
    } finally {
      setCollecting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-16 backdrop-blur-sm sm:pt-20"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Recherche et veille de news"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre de recherche */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3.5 dark:border-neutral-800">
          <Search size={20} className="text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher des news (ex: élections, grève, météo…)"
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Effacer
            </button>
          )}
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="text-gray-400 transition hover:text-red-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action de collecte en direct */}
        {query.trim().length >= 2 && (
          <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50/70 px-4 py-2.5 text-xs dark:border-neutral-800 dark:bg-neutral-800/40 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Veille Google &amp; Facebook pour &laquo;&nbsp;{query}&nbsp;&raquo;
            </span>
            <button
              type="button"
              onClick={handleCollect}
              disabled={collecting}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-1 font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
            >
              <Sparkles size={13} className={collecting ? "animate-spin" : ""} />
              {collecting ? "Collecte en cours…" : "Collecter en direct"}
            </button>
          </div>
        )}

        {/* Message de confirmation de collecte */}
        {collectMessage && (
          <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
            {collectMessage}
          </div>
        )}

        {/* Liste des résultats */}
        <ul className="max-h-[60vh] divide-y divide-gray-100 overflow-y-auto py-2 dark:divide-neutral-800 sm:max-h-96">
          {loading && (
            <li className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
              Recherche dans les news stockées…
            </li>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <li className="px-6 py-10 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucun article trouvé en base pour &laquo;&nbsp;{query}&nbsp;&raquo;.
              </p>
              <button
                type="button"
                onClick={handleCollect}
                disabled={collecting}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                <Globe size={13} />
                Lancer une collecte Google &amp; Facebook
              </button>
            </li>
          )}

          {!loading && query.trim().length < 2 && (
            <li className="px-4 py-8 text-center text-xs text-gray-400">
              Tapez au moins 2 caractères pour rechercher dans les news collectées.
            </li>
          )}

          {!loading &&
            results.map((article) => (
              <li
                key={article.id}
                className="group transition hover:bg-gray-50 dark:hover:bg-neutral-800/60"
              >
                <div className="flex items-start justify-between gap-3 px-4 py-3">
                  <Link
                    href={`/actualites/${article.id}`}
                    onClick={onClose}
                    className="min-w-0 flex-1 cursor-pointer block"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                        {article.source || "News"}
                      </span>
                      {statusBadge(article.status)}
                      {article.published_at && (
                        <span className="text-[11px] text-gray-400">
                          {new Date(article.published_at).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                    <h4 className="line-clamp-1 text-sm font-semibold text-gray-900 transition group-hover:text-red-600 dark:text-white dark:group-hover:text-red-400">
                      {article.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                      {article.content || article.description}
                    </p>
                  </Link>

                  {article.source_url && (
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 rounded-md p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-neutral-700 dark:hover:text-white"
                      title="Ouvrir la source originale"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </li>
            ))}
        </ul>

        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2.5 text-[11px] text-gray-500 dark:border-neutral-800 dark:bg-neutral-950">
          <span>{results.length} résultat(s)</span>
          <span>Échap pour fermer</span>
        </div>
      </div>
    </div>
  );
}

function subscribeAuth(callback: () => void) {
  window.addEventListener("auth:change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("auth:change", callback);
    window.removeEventListener("storage", callback);
  };
}

const getAuthSnapshot = () => authStorage.isAuthenticated();
const getAuthServerSnapshot = () => false;
const getUserSnapshot = () => authStorage.getUser<User>();
const getUserServerSnapshot = () => null;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // État du thème avec initialisation différée
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
    const timer = setTimeout(() => {
      setDark(isDark);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Synchronisation de l'authentification avec useSyncExternalStore
  const isLoggedIn = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot
  );

  const user = useSyncExternalStore(
    subscribeAuth,
    getUserSnapshot,
    getUserServerSnapshot
  );

  // Fermer le menu profil au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleLogout = () => {
    authStorage.clearAuth();
    setProfileOpen(false);
    setMobileOpen(false);
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:py-4">
          {/* Logo */}
          <div className="flex items-center justify-center gap-6">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-black dark:text-white">
              Fanilo <span className="text-red-600">.</span>
            </Link>
            <p className="hidden border-l border-gray-300 pl-6 pt-1 text-sm font-medium text-gray-500 dark:border-neutral-700 lg:block">
              Informer &middot; Signaler &middot; Agir
            </p>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-6 lg:gap-8">
              {links.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`group relative block pb-1 text-sm transition dark:text-white ${
                        isActive
                          ? "font-bold text-black dark:text-white"
                          : "font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      {link.name}
                      <span
                        className={`absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-200 ${
                          isActive ? "w-12" : "w-0 group-hover:w-12"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions à droite */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Bouton recherche */}
            <button
              type="button"
              aria-label="Rechercher des news"
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-1.5 text-gray-700 transition hover:bg-gray-100 hover:text-red-600 dark:text-gray-300 dark:hover:bg-neutral-800"
            >
              <Search size={20} strokeWidth={1.8} />
            </button>

            {/* Toggle thème */}
            <button
              type="button"
              aria-label={dark ? "Activer le mode clair" : "Activer le mode sombre"}
              onClick={toggleTheme}
              className="rounded-lg p-1.5 text-gray-700 transition hover:bg-gray-100 hover:text-red-600 dark:text-gray-300 dark:hover:bg-neutral-800"
            >
              {dark ? <Sun size={20} strokeWidth={1.8} /> : <Moon size={20} strokeWidth={1.8} />}
            </button>

            {/* Authentification : Profil si connecté, "Se connecter" sinon */}
            {isLoggedIn ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  aria-label="Menu profil utilisateur"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 ring-2 ring-transparent transition hover:ring-red-300 dark:bg-red-950/60 dark:text-red-400"
                >
                  <UserIcon size={18} strokeWidth={2.2} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-gray-100 px-3 py-2.5 dark:border-neutral-800">
                      <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                        {user?.name || user?.email || "Mon compte"}
                      </p>
                      <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                      {user?.role && (
                        <span className="mt-1.5 inline-block rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-700 dark:bg-red-950/50 dark:text-red-300">
                          {user.role}
                        </span>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-1 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <LogOut size={14} />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95 sm:px-4 sm:py-2"
              >
                Se connecter
              </Link>
            )}

            {/* Bouton hamburger (mobile uniquement) */}
            <button
              type="button"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="rounded-lg p-1.5 text-gray-700 transition hover:bg-gray-100 hover:text-red-600 dark:text-gray-300 dark:hover:bg-neutral-800 md:hidden"
            >
              {mobileOpen ? <X size={22} strokeWidth={1.8} /> : <Menu size={22} strokeWidth={1.8} />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileOpen && (
          <nav className="border-t border-gray-200 bg-white px-4 pb-4 pt-2 dark:border-neutral-800 dark:bg-neutral-950 md:hidden">
            <p className="mb-2 px-3 text-xs font-medium text-gray-500">
              Informer &middot; Signaler &middot; Agir
            </p>
            <ul className="flex flex-col">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-lg px-3 py-3 text-sm transition ${
                        isActive
                          ? "bg-red-50 font-bold text-black dark:bg-red-950/30 dark:text-white"
                          : "font-medium text-gray-600 hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}