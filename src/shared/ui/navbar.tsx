"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, UserCircle } from "lucide-react"

const links = [
    { name: "Accueil", href: "/" },
    { name: "Journaux", href: "/actualites" },
    { name: "verifier", href: "/verify" },
    { name: "Carte", href: "/carte" },
    { name: "Editorial", href: "/blog" },
]

export function Navbar() {
    const pathname = usePathname()

    return (
        <header className="w-full border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-6 justify-center">
                    <h1 className="text-2xl font-extrabold tracking-tight text-black">
                        Fanilo<span className="text-red-600">.</span>
                    </h1>
                    <p className="hidden border-l border-gray-300 pl-6 pt-2 text-sm font-medium text-gray-500 md:block">
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
                                        className={`border-b-2 pb-2 text-sm transition ${
                                        isActive
                                            ? "border-red-600 font-bold text-black"
                                            : "border-transparent font-medium text-gray-600 hover:border-red-600 hover:text-black"
                                        }`}
                                    >
                                        {link.name}
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
                        className="text-gray-700 transition hover:text-red-600"
                    >
                        <Search size={21} strokeWidth={1.8} />
                    </button>
                    <button
                        type="button"
                        aria-label="Mon compte"
                        className="text-gray-700 transition hover:text-red-600"
                    >
                        <UserCircle size={23} strokeWidth={1.8} />
                    </button>
                </div>
            </div>
        </header>
    )
}
