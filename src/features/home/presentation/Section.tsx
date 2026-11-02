"use client";

import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { renderStatusBadge } from "@/shared/ui/article_card";

export interface SectionModel {
  title: string;
  description: string;
  date: string;
  nb_coms: string;
  image: string;
  category?: string;
  status?: string;
  source?: string;
  onRead?: () => void;
  onVerify?: () => void;
}

export function Section(value: SectionModel) {
  return (
    <section className="w-full min-w-0">
      <div className="grid grid-cols-1 items-center gap-6 xl:grid-cols-2">
        <div className="flex flex-col items-start gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-red-600 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded">
              À la une
            </span>
            {value.category && (
              <span className="rounded bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-neutral-800 dark:text-gray-300">
                {value.category}
              </span>
            )}
          </div>

          <h1
            onClick={value.onRead}
            className={`text-2xl font-extrabold leading-tight tracking-tight text-gray-950 dark:text-white sm:text-3xl ${
              value.onRead ? "cursor-pointer transition hover:text-red-600" : ""
            }`}
          >
            {value.title}
          </h1>

          <p className="text-sm leading-7 text-gray-600 dark:text-gray-300 line-clamp-3">
            {value.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} />
              <span>{value.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle size={16} />
              <span>{value.nb_coms} commentaires</span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            {value.onRead ? (
              <button
                type="button"
                onClick={value.onRead}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
              >
                Lire l&apos;article
                <ArrowRight size={17} />
              </button>
            ) : (
              <a
                href="/actualites"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
              >
                Lire l&apos;article
                <ArrowRight size={17} />
              </a>
            )}

            {value.onVerify && (
              <button
                type="button"
                onClick={value.onVerify}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200"
              >
                <ShieldCheck size={17} className="text-red-600" />
                Vérifier fiabilité
              </button>
            )}
          </div>
        </div>

        <div
          onClick={value.onRead}
          className={`relative aspect-4/3 w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800 ${
            value.onRead ? "cursor-pointer" : ""
          }`}
        >
          <Image
            src={value.image}
            alt={value.title}
            fill
            priority
            unoptimized={
              typeof value.image === "string" && value.image.startsWith("http")
            }
            sizes="(max-width: 1280px) 100vw, 35vw"
            className="object-cover transition duration-500 hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
}
