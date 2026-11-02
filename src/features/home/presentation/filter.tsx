"use client"

import {
    Layers,
    ShieldAlert,
    Car,
    CloudSun,
    CalendarDays,
    HeartPulse,
    CircleEllipsis,
} from "lucide-react"

const categories = [
    { name: "Tous", icon: Layers },
    { name: "Sécurité", icon: ShieldAlert },
    { name: "Transport", icon: Car },
    { name: "Météo", icon: CloudSun },
    { name: "Événement", icon: CalendarDays },
    { name: "Santé", icon: HeartPulse },
    { name: "Autres", icon: CircleEllipsis },
]

interface FilterProps {
    active: string
    setActive: (name: string) => void
}

export function Filter({ active, setActive }: FilterProps) {
    return (
        <section className="w-full min-w-0 mt-10">
            <h2 className="relative inline-block pb-1 mb-5 text-lg font-bold text-gray-950 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-15 after:border-b-2 after:border-red-600">
                Explorer par catégorie
            </h2>
            <div className="flex gap-3">
                {categories.map(({ name, icon: Icon }) => {
                    const isActive = active === name
                    return (
                        <button
                            key={name}
                            type="button"
                            onClick={() => setActive(name)}
                            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border px-3 py-5 text-sm font-semibold transition ${
                                isActive
                                ? "border-red-600 bg-red-50 text-red-600"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-red-600"
                            }`}
                        >
                            <Icon size={20} strokeWidth={1.8} />
                            <span>{name}</span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}   