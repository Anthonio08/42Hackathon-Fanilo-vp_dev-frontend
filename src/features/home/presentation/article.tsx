"use client"

import { useEffect, useState } from "react"
import { CalendarDays, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { ArticleItem, articles } from "../infrastructure/data"
import { ArticleCard } from "@/shared/ui/article_card"



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
                {paginated.map((article, index) => (
                    <ArticleCard article={article} key={index}/>
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