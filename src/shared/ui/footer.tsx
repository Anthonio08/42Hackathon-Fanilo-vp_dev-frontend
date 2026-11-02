
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-[#111111] text-white">
            <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-6 py-12 md:grid-cols-3">
                <div className="flex flex-col items-start gap-4">
                    <h1 className="text-2xl font-extrabold tracking-tight">
                        Fanilo<span className="text-red-600">.</span>
                    </h1>

                    <p className="max-w-xs text-sm leading-6 text-gray-400">
                        Une plateforme collaborative pour une information
                        plus rapide et plus proche de vous.
                    </p>
                </div>

                <nav aria-label="Navigation principale">
                    <h2 className="mb-5 text-sm font-bold uppercase tracking-wider">
                        Navigation
                    </h2>

                    <ul className="flex flex-col gap-4">
                        <li>
                            <Link href="/" className="text-sm text-gray-400 transition hover:text-red-500">
                                Accueil
                            </Link>
                        </li>

                        <li>
                            <Link href="/actualites" className="text-sm text-gray-400 transition hover:text-red-500">
                                Actualités
                            </Link>
                        </li>

                        <li>
                            <Link href="/carte" className="text-sm text-gray-400 transition hover:text-red-500">
                                Carte des incidents
                            </Link>
                        </li>

                        <li>
                            <Link href="/blog" className="text-sm text-gray-400 transition hover:text-red-500">
                                Éditorial
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="flex flex-col items-start gap-5">
                    <h2 className="text-sm font-bold uppercase tracking-wider">
                        Participer
                    </h2>

                    <p className="max-w-xs text-sm leading-6 text-gray-400">
                        Vous êtes témoin d&apos;un incident ?
                        Partagez l&apos;information avec la communauté.
                    </p>

                    <Link
                        href="/actualites"
                        className="inline-flex items-center gap-2 bg-red-600 px-4 py-3 text-sm font-semibold transition hover:bg-red-700 rounded-2xl"
                    >
                        Explorer les actualités
                        <ArrowUpRight size={17} />
                    </Link>
                </div>
            </div>
        </footer>
    );
}
