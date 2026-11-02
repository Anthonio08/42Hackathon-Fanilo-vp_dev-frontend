"use client"

import { useState } from "react"
import { Incendie } from "@/features/home/presentation/Incident"
import { Section } from "@/features/home/presentation/Section"
import { Filter } from "./filter"
import { LastIncident } from "./last-incident"
import { Article } from "./article"

export default function HomeLayout() {
    const [active, setActive] = useState("Tous")
    return (
        <main className="mx-auto w-full max-w-7xl px-6 py-10">
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                <div className="min-w-0 lg:col-span-2">
                <Section
                    title="Incendie à Lyon : la circulation perturbée dans le centre-ville"
                    date="30 octobre 2026 - 10h26"
                    description="Un important incendie s'est déclaré ce matin dans le 2e arrondissement de Lyon. Les autorités appellent à éviter le secteur et à suivre les consignes de sécurité."
                    nb_coms="24"
                    image="/login-hero.jpg"
                />
                </div>
                <aside className="w-full lg:col-span-1">
                <Incendie />
                </aside>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                <div className="min-w-0 lg:col-span-2">
                    <Filter active={active} setActive={setActive} />
                    <div className="mt-8">
                        <Article active={active} />
                    </div>
                </div>
                <aside className="w-full lg:col-span-1">
                    <LastIncident />
                </aside>
            </div>
        </main>
    )
}   