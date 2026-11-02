"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogIn, Moon, Search, Sun, X } from "lucide-react"

const links = [
    { name: "Accueil", href: "/" },
    { name: "Journaux", href: "/actualites" },
    { name: "verifier", href: "/verify" },
    { name: "Carte", href: "/carte" },
    { name: "Editorial", href: "/blog" },
]


type SearchResult = {
    id: number
    title: string
    category: "Actualité" | "Incident" | "Blog"
    href: string
}

const FAKE_DATA: SearchResult[] = [
    { id: 1, title: "Inondation à Analakely : routes coupées", category: "Incident", href: "/carte" },
    { id: 2, title: "Coupure d'électricité à Ambohimanarina", category: "Incident", href: "/carte" },
    { id: 3, title: "Accident sur la RN7 près d'Antsirabe", category: "Incident", href: "/carte" },
    { id: 4, title: "Saison cyclonique : les bons réflexes", category: "Actualité", href: "/actualites" },
    { id: 5, title: "Nouvelle campagne de vaccination à Antananarivo", category: "Actualité", href: "/actualites" },
    { id: 6, title: "Comment signaler un incident en 3 étapes", category: "Blog", href: "/blog" },
    { id: 7, title: "Pourquoi l'information locale compte", category: "Blog", href: "/blog" },
    { id: 8, title: "Glissement de terrain à Toamasina", category: "Incident", href: "/carte" },
]

function fakeSearch(query: string): Promise<SearchResult[]> {
    const q = query.trim().toLowerCase()
    return new Promise((resolve) => {
        setTimeout(() => {
            if (!q) return resolve(FAKE_DATA.slice(0, 4))
            resolve(
                FAKE_DATA.filter(
                    (item) =>
                        item.title.toLowerCase().includes(q) ||
                        item.category.toLowerCase().includes(q)
                )
            )
        }, 300)
    })
}


function SearchModal({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose])

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        const t = setTimeout(async () => {
            const data = await fakeSearch(query)
            if (!cancelled) {
                setResults(data)
                setLoading(false)
            }
        }, 150)
        return () => {
            cancelled = true
            clearTimeout(t)
        }
    }, [query])

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-24"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Recherche"
        >
            <div
                className="w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-xl dark:bg-neutral-900"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-neutral-700">
                    <Search size={18} className="text-gray-500" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher une actualité, un incident, un article…"
                        className="flex-1 bg-transparent text-sm text-black outline-none placeholder:text-gray-400 dark:text-white"
                    />
                    <button
                        type="button"
                        aria-label="Fermer"
                        onClick={onClose}
                        className="text-gray-500 transition hover:text-red-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <ul className="max-h-80 overflow-y-auto py-2">
                    {loading && (
                        <li className="px-4 py-3 text-sm text-gray-500">Recherche en cours…</li>
                    )}
                    {!loading && results.length === 0 && (
                        <li className="px-4 py-3 text-sm text-gray-500">
                            Aucun résultat pour « {query} ». Essayez un autre mot-clé.
                        </li>
                    )}
                    {!loading &&
                        results.map((r) => (
                            <li key={r.id}>
                                <Link
                                    href={r.href}
                                    onClick={onClose}
                                    className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm text-black transition hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-800"
                                >
                                    <span>{r.title}</span>
                                    <span className="shrink-0 text-xs font-medium text-red-600">
                                        {r.category}
                                    </span>
                                </Link>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    )
}


export function Navbar() {
    const pathname = usePathname()
    const [searchOpen, setSearchOpen] = useState(false)
    const [dark, setDark] = useState(false)
    useEffect(() => {
        const saved = localStorage.getItem("theme")
        const isDark = saved === "dark"
        setDark(isDark)
        document.documentElement.classList.toggle("dark", isDark)
    }, [])

    const toggleTheme = () => {
        const next = !dark
        setDark(next)
        document.documentElement.classList.toggle("dark", next)
        localStorage.setItem("theme", next ? "dark" : "light")
    }

    return (
        <>
            <header className="w-full border-b border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-6 justify-center">
                        <h1 className="text-2xl font-extrabold tracking-tight text-black dark:text-white">
                            Fanilo <span className="text-red-600">.</span>
                        </h1>
                        <p className="hidden border-l border-gray-300 pl-6 pt-2 text-sm font-medium ligth:text-gray-500 dark:border-neutral-700 md:block">
                            Informer - Signaler - Agir
                        </p>
                    </div>

                    <nav className="hidden md:block">
                        <ul className="flex items-center gap-8">
                            {links.map((link) => {
                                const isActive = pathname === link.href

                                return (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={`group relative block pb-2 text-sm transition dark:text-white ${
                                                isActive
                                                    ? "font-bold text-black dark:text-white"
                                                    : "font-medium ligth:text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
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
                                )
                            })}
                        </ul>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            aria-label="Rechercher"
                            onClick={() => setSearchOpen(true)}
                            className="text-gray-700 transition hover:text-red-600 dark:text-gray-300"
                        >
                            <Search size={21} strokeWidth={1.8} />
                        </button>

                        <button
                            type="button"
                            aria-label={dark ? "Activer le mode clair" : "Activer le mode sombre"}
                            onClick={toggleTheme}
                            className="text-gray-700 transition hover:text-red-600 dark:text-gray-300"
                        >
                            {dark ? (
                                <Sun size={21} strokeWidth={1.8} />
                            ) : (
                                <Moon size={21} strokeWidth={1.8} />
                            )}
                        </button>

                        <Link
                            href="/login"
                            className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Se connecter
                        </Link>
                    </div>
                </div>
            </header>

            {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
        </>
    )
}