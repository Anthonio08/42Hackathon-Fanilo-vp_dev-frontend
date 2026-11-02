"use client"

import { useEffect, useState } from "react"
import { CalendarDays, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { ArticleItem, articles } from "../infrastructure/data"

const colorMap: Record<ArticleItem["color"], string> = {
    red: "bg-red-600",
    blue: "bg-blue-600",
    yellow: "bg-yellow-600",
    purple: "bg-purple-600",
    green: "bg-green-600",
}

const ITEMS_PER_PAGE = 6

interface ArticleProps {
    active: string
}

export function Article({ active }: ArticleProps) {
    const [page, setPage] = useState(1)
    useEffect(() => {
        setPage(1)
    }, [active])

    const filtered =
        active === "Tous"
        ? articles
        : articles.filter((a) => a.category === active)

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    const handlePage = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setPage(newPage)
    }

    return (
        <section className="mt-10">
            <h2 className="relative inline-block pb-1 mb-5 text-lg font-bold text-gray-950 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-15 after:border-b-2 after:border-red-600">
                Dernières actualités
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginated.map((article) => (
                    <article
                        key={article.title}
                        className="group flex cursor-pointer flex-col border border-gray-200 bg-white transition hover:shadow-md"
                    >
                        <div className="relative aspect-video w-full overflow-hidden">
                            <Image
                                src={article.image}
                                alt={article.title}
                                loading="eager"
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transition duration-500 group-hover:scale-105"
                            />
                        </div>

                        <div className="gap-3 p-4">
                            <div className="flex items-center mb-3">
                                <div className={`w-1 h-4 mr-2 ${colorMap[article.color]}`} />
                                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    {article.category}
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col gap-1">
                                <h3 className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-red-600">
                                    {article.title}
                                </h3>
                                <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
                                    {article.description}
                                </p>
                                <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <CalendarDays size={14} />
                                        {article.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageCircle size={14} />
                                        {article.nbComs}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {filtered.length === 0 && (
                <p className="text-sm text-gray-400">Aucun article dans cette catégorie.</p>
            )}

            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => handlePage(page - 1)}
                        disabled={page === 1}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                        <ChevronLeft size={16} />
                        Précédent
                    </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => handlePage(p)}
                        className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                            p === page
                            ? "bg-red-600 text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {p}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={() => handlePage(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                    Suivant
                    <ChevronRight size={16} />
                </button>
                </div>
            )}
        </section>
    )
}   