"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ThumbsUp,
  X,
} from "lucide-react";
import {
  points as initialPoints,
  type IncidentPoint,
  type IncidentCategory,
  type IncidentSeverity,
} from "../domain/data";
import { TitleComponent } from "@/features/article/presentation/actualites";

// Dynamic import of Leaflet map to avoid SSR "window is not defined" issues
const SatelliteMap = dynamic(
  () => import("./carte").then((mod) => mod.SatelliteMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[560px] w-full flex-col items-center justify-center rounded-2xl bg-gray-100 p-8 text-center dark:bg-neutral-800">
        <Compass size={40} className="animate-spin text-red-600 mb-3" />
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Chargement de la carte interactive…
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Initialisation des calques et des marqueurs géolocalisés
        </p>
      </div>
    ),
  }
);

const CATEGORIES_CONFIG: {
  name: IncidentCategory | "Tous";
  color: string;
  badgeBg: string;
}[] = [
  { name: "Tous", color: "#e11d48", badgeBg: "bg-red-600" },
  { name: "Sécurité", color: "#e11d48", badgeBg: "bg-rose-600" },
  { name: "Transport", color: "#2563eb", badgeBg: "bg-blue-600" },
  { name: "Météo", color: "#f59e0b", badgeBg: "bg-amber-500" },
  { name: "Événement", color: "#8b5cf6", badgeBg: "bg-violet-500" },
  { name: "Santé", color: "#10b981", badgeBg: "bg-emerald-500" },
  { name: "Autres", color: "#6b7280", badgeBg: "bg-gray-500" },
];

const ANTANANARIVO_CENTER: [number, number] = [-18.8792, 47.5079];

export function CarteLayout() {
  const [incidents, setIncidents] = useState<IncidentPoint[]>(() => initialPoints);
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory | "Tous">("Tous");
  const [selectedSeverity, setSelectedSeverity] = useState<IncidentSeverity | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapType, setMapType] = useState<"satellite" | "streets">("satellite");

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>(ANTANANARIVO_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(14);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Modal report state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportCategory, setReportCategory] = useState<IncidentCategory>("Sécurité");
  const [reportDistrict, setReportDistrict] = useState("Analakely");
  const [reportSeverity, setReportSeverity] = useState<IncidentSeverity>("medium");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  const [, startTransition] = useTransition();
  const searchParams = useSearchParams();

  // Ouvrir automatiquement le modal si demandé par URL (?report=true)
  useEffect(() => {
    if (searchParams.get("report") === "true") {
      setIsReportModalOpen(true);
    }
  }, [searchParams]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      // Category filter
      if (selectedCategory !== "Tous" && item.category !== selectedCategory) {
        return false;
      }
      // Severity filter
      if (selectedSeverity !== "all" && item.severity !== selectedSeverity) {
        return false;
      }
      // Search query (label, district, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.label.toLowerCase().includes(q);
        const matchDistrict = item.district.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        return matchTitle || matchDistrict || matchDesc || matchCat;
      }
      return true;
    });
  }, [incidents, selectedCategory, selectedSeverity, searchQuery]);

  // Quick stats
  const stats = useMemo(() => {
    const total = incidents.length;
    const high = incidents.filter((i) => i.severity === "high").length;
    const verified = incidents.filter((i) => i.status === "verified").length;
    const pending = incidents.filter((i) => i.status === "pending").length;
    return { total, high, verified, pending };
  }, [incidents]);

  // Categories count
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Tous: incidents.length };
    CATEGORIES_CONFIG.forEach((c) => {
      if (c.name !== "Tous") {
        counts[c.name] = incidents.filter((i) => i.category === c.name).length;
      }
    });
    return counts;
  }, [incidents]);

  // Handle clicking an incident card
  const handleSelectIncident = (incident: IncidentPoint) => {
    setSelectedIncidentId(incident.id);
    setMapCenter([...incident.position]);
    setMapZoom(16);
  };

  // Confirm incident (+1)
  const handleConfirmIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, confirmations: item.confirmations + 1 } : item
      )
    );
  };

  // Reset view to default
  const handleResetView = () => {
    setMapCenter(ANTANANARIVO_CENTER);
    setMapZoom(14);
    setSelectedIncidentId(null);
    setSelectedCategory("Tous");
    setSelectedSeverity("all");
    setSearchQuery("");
  };

  // Submit report
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportDescription.trim()) return;

    // Small random offset around center
    const latOffset = (Math.random() - 0.5) * 0.03;
    const lngOffset = (Math.random() - 0.5) * 0.03;
    const newPos: [number, number] = [
      ANTANANARIVO_CENTER[0] + latOffset,
      ANTANANARIVO_CENTER[1] + lngOffset,
    ];

    const catConfig = CATEGORIES_CONFIG.find((c) => c.name === reportCategory);

    const newIncident: IncidentPoint = {
      id: `rep-${Date.now()}`,
      position: newPos,
      label: reportTitle.trim(),
      category: reportCategory,
      color: catConfig?.color || "#e11d48",
      district: reportDistrict.trim() || "Antananarivo",
      time: "À l'instant",
      severity: reportSeverity,
      status: "pending",
      description: reportDescription.trim(),
      confirmations: 1,
    };

    startTransition(() => {
      setIncidents((prev) => [newIncident, ...prev]);
      setMapCenter(newPos);
      setMapZoom(16);
      setSelectedIncidentId(newIncident.id);
      setIsReportModalOpen(false);
      setReportSuccess("Votre signalement a été épinglé sur la carte avec succès !");

      // Reset form
      setReportTitle("");
      setReportDescription("");
    });

    setTimeout(() => {
      setReportSuccess(null);
    }, 6000);
  };

  return (
    <div className="w-full pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6">
        {/* ── Titre & Actions ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TitleComponent
            title="Carte des Incidents en Direct"
            description="Veille citoyenne et cartographie participative des événements et alertes en temps réel à Madagascar."
          />

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
            >
              <Plus size={16} />
              Signaler un incident
            </button>
            <button
              type="button"
              onClick={handleResetView}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300"
            >
              <RefreshCw size={14} />
              Réinitialiser la vue
            </button>
          </div>
        </div>

        {/* ── Notification de signalement réussi ── */}
        {reportSuccess && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{reportSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setReportSuccess(null)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Bandeau de Statistiques Clés ── */}
        {/* <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-950 dark:text-white">
                {stats.total}
              </p>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Incidents répertoriés
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400">
                {stats.high}
              </p>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Alertes critiques
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.verified}
              </p>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Confirmés par la cellule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                {stats.pending}
              </p>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                En cours de vérification
              </p>
            </div>
          </div>
        </div> */}

        {/* ── Barre de Contrôles & Filtres ── */}
        {/* <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par mot-clé ou quartier (Analakely, Besarety, accident, vol…)"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-10 pr-4 text-xs text-gray-900 outline-none transition focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Gravité :
            </span>
            {[
              { id: "all", label: "Toutes" },
              { id: "high", label: "Critique" },
              { id: "medium", label: "Modéré" },
              { id: "low", label: "Faible" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSeverity(s.id as IncidentSeverity | "all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  selectedSeverity === s.id
                    ? "bg-red-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-neutral-700 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setMapType("satellite")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                mapType === "satellite"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-900 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400"
              }`}
            >
              <Layers size={13} />
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapType("streets")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                mapType === "streets"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-900 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400"
              }`}
            >
              <Compass size={13} />
              Plan Urbain
            </button>
          </div>
        </div> */}

        {/* ── Filtres Catégories sous forme de Pills ── */}
        {/* <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES_CONFIG.map((cat) => {
            const isActive = selectedCategory === cat.name;
            const count = categoryCounts[cat.name] || 0;

            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: isActive ? "#ffffff" : cat.color }}
                />
                <span>{cat.name}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div> */}

        {/* ── Cœur de l'Expérience : Split Screen Carte + Feed interactif ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* ── Carte Interactive (8 colonnes) ── */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="relative w-full h-[600px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-lg dark:border-neutral-800">
              <SatelliteMap
                markers={filteredIncidents}
                center={mapCenter}
                zoom={mapZoom}
                mapType={mapType}
                selectedMarkerId={selectedIncidentId}
                onSelectMarker={(m) => handleSelectIncident(m)}
                onConfirmIncident={handleConfirmIncident}
              />

        
            </div>

            {/* Légende rapide sous la carte */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3 text-xs text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Codes couleurs des marqueurs :
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {CATEGORIES_CONFIG.filter((c) => c.name !== "Tous").map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Volet Latéral Interactif des Incidents (4 colonnes) ── */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Fil des signalements ({filteredIncidents.length})
              </h3>
              <span className="text-[11px] text-gray-400">
                Cliquer pour localiser
              </span>
            </div>

            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredIncidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
                  <Filter size={32} className="text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Aucun incident trouvé
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Essayez d&apos;élargir vos filtres ou de vider la recherche.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetView}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                  >
                    Réinitialiser
                  </button>
                </div>
              ) : (
                filteredIncidents.map((incident) => {
                  const isSelected = selectedIncidentId === incident.id;

                  return (
                    <div
                      key={incident.id}
                      onClick={() => handleSelectIncident(incident)}
                      className={`group cursor-pointer rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900 ${
                        isSelected
                          ? "border-red-600 ring-2 ring-red-100 dark:ring-red-950"
                          : "border-gray-200 hover:border-gray-300 dark:border-neutral-800"
                      }`}
                    >
                      {/* En-tête de carte */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                          style={{ backgroundColor: incident.color }}
                        >
                          {incident.category}
                        </span>
                      </div>

                      {/* Titre */}
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-red-600 dark:text-white leading-snug">
                        {incident.label}
                      </h4>

                      {/* Quartier */}
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <MapPin size={12} className="text-red-600 shrink-0" />
                        <span className="truncate">{incident.district}</span>
                      </p>

                      {/* Description */}
                      <p className="mt-2 text-xs leading-relaxed text-gray-600 line-clamp-2 dark:text-gray-300">
                        {incident.description}
                      </p>

                      {/* Footer de carte */}
                      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-[11px] dark:border-neutral-800">
                        <span className="text-gray-400 flex items-center gap-1">
                          <ThumbsUp size={11} /> {incident.confirmations} témoins
                        </span>

                        <span className="font-semibold text-red-600 group-hover:underline">
                          Voir sur la carte &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal « Signaler un incident citoyen » ── */}
      {isReportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-neutral-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600" />
                Signaler un incident sur la carte
              </h3>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="text-gray-400 hover:text-red-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Titre / Nature de l&apos;incident *
                </label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Ex : Accident deux-roues et chaussée bloquée…"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-xs outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Catégorie
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value as IncidentCategory)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs outline-none transition focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    {CATEGORIES_CONFIG.filter((c) => c.name !== "Tous").map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Niveau d&apos;urgence
                  </label>
                  <select
                    value={reportSeverity}
                    onChange={(e) => setReportSeverity(e.target.value as IncidentSeverity)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs outline-none transition focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="high">Critique / Urgent</option>
                    <option value="medium">Modéré</option>
                    <option value="low">Faible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Quartier / Localisation *
                </label>
                <input
                  type="text"
                  required
                  value={reportDistrict}
                  onChange={(e) => setReportDistrict(e.target.value)}
                  placeholder="Ex : Analakely, 67Ha, Ankorondrano, Itaosy…"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-xs outline-none transition focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Description détaillée des faits *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Précisez ce qui s'est passé, les voies coupées, les consignes aux usagers…"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-xs outline-none transition focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!reportTitle.trim() || !reportDescription.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  <Plus size={14} />
                  Publier sur la carte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
