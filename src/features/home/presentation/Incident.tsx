"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Megaphone } from "lucide-react";

export function Incendie() {
    return (
        <section className="flex w-full flex-col items-center justify-center bg-red-600 px-5 py-7 text-center text-white">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <Megaphone size={25} />
            </div>
            <h2 className="mb-3 text-xl font-extrabold tracking-tight">
                Signaler un incident
            </h2>
            <p className="mb-6 max-w-xs text-sm leading-6 text-white/90">
                Vous êtes témoin d&apos;un incident ?
                Partagez les informations avec la communauté
                et les journalistes.
            </p>
            <div className="flex w-full flex-col gap-3">
                <Link
                    href="/carte?report=true"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-gray-100"
                >
                    Déclarer un incident
                    <ArrowRight size={17} />
                </Link>
                <Link
                    href="/carte"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/80 px-4 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-red-600"
                >
                    <MapPin size={17} />
                    Voir la carte
                </Link>
            </div>
        </section>
    );
}
