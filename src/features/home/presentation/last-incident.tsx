"use client"

import { Input } from "@base-ui/react"
import { ArrowRight, Send } from "lucide-react"

interface Incident {
    type: string
    lieu: string
    heure: number
    color: "red" | "blue" | "yellow" | "purple" | "green"
}

const incidents: Incident[] = [
    { type: "Incendie", lieu: "Behoririka", heure: 2, color: "red" },
    { type: "Inondation", lieu: "Mananjary", heure: 4, color: "blue" },
    { type: "Accident de la route", lieu: "Tamatave", heure: 2, color: "yellow" },
    { type: "Tempête", lieu: "Antananarivo", heure: 2, color: "purple" },
    { type: "Panne électrique", lieu: "Itaosy", heure: 2, color: "green" },
]

const colorMap: Record<Incident["color"], string> = {
    red: "bg-red-600",
    blue: "bg-blue-600",
    yellow: "bg-yellow-600",
    purple: "bg-purple-600",
    green: "bg-green-600",
}

const value_sub = [
    {name: "Incendie"},
    {name: "Inondations"},
    {name: "Grève"},
    {name: "Météo"},
    {name: "Accident"},
    {name: "Santé"},
    {name: "Environnment"},
    {name: "Sécurité"}
]

export function LastIncident() {
    return (
        <section className="w-full min-w-0 mt-10">
            <h2 className="relative inline-block pb-1 mb-5 text-lg font-bold text-gray-950 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-15 after:border-b-2 after:border-red-600">
                Derniers incidents
            </h2>

            <ul className="relative flex flex-col gap-1">
                {incidents.map((incident, index) => (
                    <li
                        key={index}
                        className="relative flex items-center justify-between border-b border-gray-200 pb-2 mt-5"
                    >
                        <div className="flex items-start gap-2">
                            <span
                                className={`mt-1.25 inline-block h-2 w-2 shrink-0 rounded-full ${colorMap[incident.color]}`}
                            />
                            <div>
                                <p className="text-sm font-medium">
                                    {incident.type} - {incident.lieu}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    il y a {incident.heure}h
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            aria-label={`Voir le détail de ${incident.type} à ${incident.lieu}`}
                            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-gray-100 hover:text-foreground"
                        >
                            <ArrowRight className="size-4" />
                        </button>
                    </li>
                ))}
            </ul>
            <div className="relative mt-5 gap-8 pb-2">
                <h2 className="relative inline-block pb-1 mb-5 text-lg font-bold text-gray-950 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-15 after:border-b-2 after:border-red-600">
                    Sujets populaires
                </h2>
                <div className="flex flex-wrap gap-2">
                    {value_sub.map((val) => (
                        <span key={val.name} className="rounded-2xl bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
                            {val.name}
                        </span>
                    ))}
                </div>
                <div className="flex w-full mt-10 flex-col items-start gap-3 border-2 border-gray-300 p-5">
                    <Send size={20} className="text-red-600" />
                    <h3 className="font-bold">Restez informé</h3>
                    <p className="text-sm text-gray-500">
                        Recevez les dernières actualités directement dans votre boîte mail
                    </p>
                    <Input placeholder="votre adresse e-mail" className="rounded-md border-2 p-2 w-full" />
                    <button
                        type="button"
                        className="mt-1 inline-flex w-full items-center justify-center gap-2 bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                    >
                        S'abonner
                    </button>
                </div>
            </div>
        </section>
    )
}   