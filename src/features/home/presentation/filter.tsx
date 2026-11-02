"use client";

import {
  Layers,
  ShieldAlert,
  Car,
  CloudSun,
  CalendarDays,
  HeartPulse,
  CircleEllipsis,
} from "lucide-react";

export const CATEGORIES_LIST = [
  { name: "Tous", icon: Layers },
  { name: "Sécurité", icon: ShieldAlert },
  { name: "Transport", icon: Car },
  { name: "Météo", icon: CloudSun },
  { name: "Événement", icon: CalendarDays },
  { name: "Santé", icon: HeartPulse },
  { name: "Autres", icon: CircleEllipsis },
] as const;

interface FilterProps {
  active: string;
  setActive: (name: string) => void;
  counts?: Record<string, number>;
}

export function Filter({ active, setActive, counts }: FilterProps) {
  return (
    <section className="w-full min-w-0 mt-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="relative inline-block pb-1 text-lg font-bold text-gray-950 dark:text-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-15 after:border-b-2 after:border-red-600">
          Explorer par catégorie
        </h2>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORIES_LIST.map(({ name, icon: Icon }) => {
          const isActive = active === name;
          const count = counts?.[name];
          return (
            <button
              key={name}
              type="button"
              onClick={() => setActive(name)}
              className={`flex min-w-[90px] flex-1 flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-xs font-semibold transition sm:text-sm ${
                isActive
                  ? "border-red-600 bg-red-50 text-red-600 shadow-xs dark:bg-red-950/40 dark:text-red-400"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-red-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300 dark:hover:text-red-400"
              }`}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span className="whitespace-nowrap">{name}</span>
              {typeof count === "number" && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive
                      ? "bg-red-200/80 text-red-800 dark:bg-red-900/60 dark:text-red-200"
                      : "bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}   