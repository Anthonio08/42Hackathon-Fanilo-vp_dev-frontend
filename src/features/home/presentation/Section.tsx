"use client"

import Image from "next/image"
import {
    ArrowRight,
    CalendarDays,
    MessageCircle
} from "lucide-react"

interface SectionModel {
    title: string
    description: string
    date: string
    nb_coms: string
    image: string
}

export function Section(value: SectionModel) {
    return (
        <section className="w-full min-w-0">
            <div className="grid grid-cols-1 items-center gap-6 xl:grid-cols-2">
                <div className="flex flex-col items-start gap-4">
                    <span className=" bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                        À la une
                    </span>
                    <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-gray-950 sm:text-3xl">
                        {value.title}
                    </h1>
                    <p className="text-sm leading-7 text-gray-600">
                        {value.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <CalendarDays size={16} />
                            <span>{value.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageCircle size={16} />
                            <span>{value.nb_coms} commentaires</span>
                        </div>
                    </div>
                    <a
                        href="/blog"
                        className="mt-2 inline-flex items-center gap-2 bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                    >
                        Lire l'article
                        <ArrowRight size={17} />
                    </a>
                </div>
                <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-gray-100">
                    <Image
                        src={value.image}
                        alt={value.title}
                        fill
                        priority
                        sizes="(max-width: 1280px) 100vw, 35vw"
                        className="object-cover transition duration-500 hover:scale-105"
                    />
                </div>
            </div>
        </section>
    )
}
