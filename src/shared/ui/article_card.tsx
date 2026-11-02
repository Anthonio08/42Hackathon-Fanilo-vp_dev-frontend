import { ArticleItem } from "@/features/home/infrastructure/data"
import { CalendarDays, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"


const colorMap: Record<ArticleItem["color"], string> = {
    red: "bg-red-600",
    blue: "bg-blue-600",
    yellow: "bg-yellow-600",
    purple: "bg-purple-600",
    green: "bg-green-600",
}

export function ArticleCard({
    article
}: {
    article: ArticleItem
})
{
    return (
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
    )
}