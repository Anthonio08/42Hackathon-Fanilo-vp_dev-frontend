"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, User, X } from "lucide-react";
import { cn } from "cn";
import { Logo } from "@/shared/ui/logo";

const ACTION_LINKS = [
  { href: "/informer", label: "Informer" },
  { href: "/signaler", label: "Signaler" },
  { href: "/agir", label: "Agir" },
];

const MAIN_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/actualites", label: "Actualités" },
  { href: "/carte-des-incidents", label: "Carte des incidents" },
  { href: "/blog", label: "Blog" },
];

const MOBILE_LINKS = [...ACTION_LINKS, ...MAIN_LINKS];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-background border-border/40 sticky top-0 z-50 border-b">
      <nav
        aria-label="Navigation principale"
        className="flex h-16 items-center justify-between gap-6 px-6 sm:px-8 lg:px-11"
      >
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" aria-label="FANILO, accueil" className="shrink-0">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1.5 text-sm lg:flex">
            {ACTION_LINKS.map((link, index) => (
              <Fragment key={link.href}>
                {index > 0 && (
                  <li
                    aria-hidden
                    className="text-muted-foreground/50 select-none"
                  >
                    ·
                  </li>
                )}
                <li>
                  <Link
                    href={link.href}
                    aria-current={
                      isActivePath(pathname, link.href) ? "page" : undefined
                    }
                    className={cn(
                      "hover:text-foreground transition-colors",
                      isActivePath(pathname, link.href)
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              </Fragment>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
          <ul className="hidden items-center gap-8 text-sm lg:flex">
            {MAIN_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <li key={link.href} className="flex h-16 items-center">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "hover:text-foreground relative flex h-full items-center transition-colors",
                      active
                        ? "text-foreground font-semibold after:absolute after:inset-x-0 after:bottom-1 after:h-0.75 after:bg-[#df060f] after:content-['']"
                        : "text-muted-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3 sm:gap-5 lg:gap-10">
            <button
              type="button"
              aria-label="Rechercher"
              className="text-foreground/80 hover:text-foreground -m-2 p-2 transition-colors"
            >
              <Search className="size-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Mon compte"
              className="text-foreground/80 hover:text-foreground -m-2 p-2 transition-colors"
            >
              <User className="size-5" strokeWidth={1.5} />
            </button>
          </div>

          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((value) => !value)}
            className="text-foreground -m-2 p-2 lg:hidden"
          >
            {open ? (
              <X className="size-6" strokeWidth={1.5} />
            ) : (
              <Menu className="size-6" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="menu-mobile"
          className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 border-border/60 border-t px-6 py-4 lg:hidden"
        >
          <ul className="flex flex-col text-sm">
            {MOBILE_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <li key={`mobile-${link.href}`}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "border-border/40 hover:text-foreground block border-b py-2.5 transition-colors last:border-b-0",
                      active
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
