"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Send } from "lucide-react";
import type { ArticleItem } from "@/features/article/domain/article.entity";

interface IncidentItem {
  type: string;
  lieu: string;
  heure: number;
  color: "red" | "blue" | "yellow" | "purple" | "green";
  article?: ArticleItem;
}

const defaultIncidents: IncidentItem[] = [
  { type: "Incendie", lieu: "Behoririka", heure: 2, color: "red" },
  { type: "Inondation", lieu: "Mananjary", heure: 4, color: "blue" },
  { type: "Accident de la route", lieu: "Tamatave", heure: 2, color: "yellow" },
  { type: "Tempête", lieu: "Antananarivo", heure: 2, color: "purple" },
  { type: "Panne électrique", lieu: "Itaosy", heure: 2, color: "green" },
];

const colorMap: Record<IncidentItem["color"], string> = {
  red: "bg-red-600",
  blue: "bg-blue-600",
  yellow: "bg-yellow-600",
  purple: "bg-purple-600",
  green: "bg-green-600",
};

const value_sub = [
  { name: "Sécurité" },
  { name: "Transport" },
  { name: "Météo" },
  { name: "Événement" },
  { name: "Santé" },
  { name: "Autres" },
];

interface LastIncidentProps {
  articles?: ArticleItem[];
  onSelectIncident?: (article: ArticleItem) => void;
  onSelectCategory?: (category: string) => void;
}

export function LastIncident({
  articles,
  onSelectIncident,
  onSelectCategory,
}: LastIncidentProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Dérivation des incidents depuis les articles dynamiques si disponibles
  const dynamicIncidents: IncidentItem[] = useMemo(() => {
    if (!articles || articles.length === 0) return defaultIncidents;

    const colors: IncidentItem["color"][] = [
      "red",
      "blue",
      "yellow",
      "purple",
      "green",
    ];
    return articles.slice(0, 5).map((a, idx) => ({
      type: a.category || a.source || "Alerte",
      lieu: a.title.slice(0, 32),
      heure: (idx + 1) * 2,
      color: colors[idx % colors.length],
      article: a,
    }));
  }, [articles]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <section className="w-full min-w-0 mt-10">
      <h2 className="relative inline-block pb-1 mb-5 text-lg font-bold text-gray-950 dark:text-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-15 after:border-b-2 after:border-red-600">
        Derniers incidents
      </h2>

      <ul className="relative flex flex-col gap-1">
        {dynamicIncidents.map((incident, index) => (
          <li
            key={index}
            onClick={() => incident.article && onSelectIncident?.(incident.article)}
            className={`group relative flex items-center justify-between border-b border-gray-100 pb-2.5 pt-3.5 transition dark:border-neutral-800 ${
              incident.article ? "cursor-pointer hover:bg-gray-50/70 dark:hover:bg-neutral-850 px-2 rounded-lg" : ""
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span
                className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${colorMap[incident.color]}`}
              />
              <div>
                <p className="text-xs font-semibold text-gray-900 group-hover:text-red-600 dark:text-white dark:group-hover:text-red-400 line-clamp-1">
                  {incident.type} - {incident.lieu}
                </p>
                <p className="text-[11px] text-gray-400">
                  il y a {incident.heure}h
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label={`Voir le détail de ${incident.type} à ${incident.lieu}`}
              className="rounded-full p-1.5 text-gray-400 transition group-hover:text-red-600 dark:hover:bg-neutral-800"
            >
              <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative mt-8 gap-8 pb-2">
        <h2 className="relative inline-block pb-1 mb-5 text-lg font-bold text-gray-950 dark:text-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-15 after:border-b-2 after:border-red-600">
          Sujets populaires
        </h2>
        <div className="flex flex-wrap gap-2">
          {value_sub.map((val) => (
            <button
              key={val.name}
              type="button"
              onClick={() => onSelectCategory?.(val.name)}
              className="rounded-2xl border border-transparent bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-600 hover:bg-white hover:text-red-600 dark:bg-neutral-800 dark:text-gray-300 dark:hover:border-red-500"
            >
              {val.name}
            </button>
          ))}
        </div>

        <div className="flex w-full mt-8 flex-col items-start gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <Send size={18} className="text-red-600" />
          <h3 className="font-bold text-gray-950 dark:text-white text-sm">
            Restez informé
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Recevez les dernières alertes vérifiées directement dans votre boîte mail.
          </p>

          {subscribed ? (
            <div className="flex w-full items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 size={16} />
              <span>Inscription réussie ! Vous recevrez nos alertes.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="w-full space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre adresse e-mail…"
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-900 outline-none transition focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 shadow-xs"
              >
                S&apos;abonner aux alertes
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
