"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  HelpCircle,
  History,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { verificationRepository } from "../repository/verification.repository";
import type {
  VerificationItem,
  VerificationSource,
  VerificationVerdict,
} from "../domain/verification.entity";
import { FacebookIcon, GoogleIcon } from "@/shared/layout/icon";
import { TitleComponent } from "@/features/article/presentation/actualites";


const SUGGESTIONS = [
  "Mickael Randrianirina est president de la republique",
  "Fermeture définitive du lac Behoririka sans relogement",
  "Rupture d'eau potable dans tout Antananarivo",
  "Le cyclone de catégorie 4 frappe la côte Est demain",
];

function getVerdictInfo(verdict?: VerificationVerdict) {
  const v = verdict?.toLowerCase() || "";
  if (v === "true" || v === "likely_true") {
    return {
      title: "Probablement Vrai",
      label: "Information Confirmée",
      badgeClass: "bg-emerald-600 text-white",
      bgClass: "bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/60",
      textClass: "text-emerald-800 dark:text-emerald-300",
      icon: CheckCircle2,
    };
  }
  if (v === "false" || v === "likely_false") {
    return {
      title: "Probablement Faux",
      label: "Fake News Détectée",
      badgeClass: "bg-red-600 text-white",
      bgClass: "bg-red-50/80 border-red-200 dark:bg-red-950/20 dark:border-red-900/60",
      textClass: "text-red-800 dark:text-red-300",
      icon: AlertOctagon,
    };
  }
  if (v === "mixed") {
    return {
      title: "Controversé / Partagé",
      label: "Avis divergents",
      badgeClass: "bg-purple-600 text-white",
      bgClass: "bg-purple-50/80 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900/60",
      textClass: "text-purple-800 dark:text-purple-300",
      icon: HelpCircle,
    };
  }
  return {
    title: "Non Vérifié",
    label: "Sources insuffisantes",
    badgeClass: "bg-gray-500 text-white",
    bgClass: "bg-gray-50/80 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/60",
    textClass: "text-amber-800 dark:text-amber-300",
    icon: AlertTriangle,
  };
}

export function VerifyLayout() {
  const searchParams = useSearchParams();
  const initialUrlClaim = searchParams.get("claim");

  const [claim, setClaim] = useState(() => initialUrlClaim || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<VerificationItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [, startTransition] = useTransition();

  const handleVerify = async (textToVerify?: string) => {
    const text = (textToVerify ?? claim).trim();
    if (!text) return;

    setLoading(true);
    setError(null);

    try {
      const data = await verificationRepository.verify(text);
      startTransition(() => {
        setResult(data);
        // Ajoute en tête d'historique s'il n'y est pas déjà
        setHistory((prev) => {
          if (prev.some((item) => item.id === data.id)) return prev;
          return [data, ...prev];
        });
      });
    } catch (err) {
      console.error("Erreur lors de la vérification :", err);
      setError(
        "Impossible d'analyser l'information pour le moment. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  // Chargement de l'historique public des vérifications
  useEffect(() => {
    let cancelled = false;

    verificationRepository
      .listAll(1, 10)
      .then((res) => {
        if (!cancelled && res && Array.isArray(res.verifications)) {
          setHistory(res.verifications);
        }
      })
      .catch((err) => {
        console.warn("Erreur chargement historique vérifications:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Déclenchement automatique si claim passé par URL
  useEffect(() => {
    if (!initialUrlClaim || !initialUrlClaim.trim()) return;

    const text = initialUrlClaim.trim();
    let cancelled = false;

    verificationRepository
      .verify(text)
      .then((data) => {
        if (!cancelled) {
          startTransition(() => {
            setResult(data);
            setHistory((prev) => {
              if (prev.some((item) => item.id === data.id)) return prev;
              return [data, ...prev];
            });
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Erreur lors de la vérification auto :", err);
          setError(
            "Impossible d'analyser l'information pour le moment. Veuillez réessayer."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialUrlClaim]);

  const handleSelectSuggestion = (s: string) => {
    setClaim(s);
    handleVerify(s);
  };

  const verdictInfo = result ? getVerdictInfo(result.verdict) : null;
  const confidencePercent = result
    ? Math.round(result.confidence_score * 100)
    : 0;

  return (
    <main className="w-full pb-16 pt-8">
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* En-tête */}
    
        <TitleComponent title="Vérificateur d&apos;Informations" description="Soumettez une rumeur, déclaration ou affirmation. Notre moteur
            analyse Google et Facebook en temps réel, croise les sources et
            établit un verdict de fiabilité."/>

        {/* Formulaire de vérification */}
        <div className="rounded-2xl mt-5 border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="flex flex-col gap-4"
          >
            <label
              htmlFor="claim-input"
              className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
            >
              Affirmation à vérifier :
            </label>
            <div className="relative">
              <input
                id="claim-input"
                type="text"
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="Ex : Mickael Randrianirina est président de la république…"
                className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-4 pr-12 text-sm text-gray-900 outline-none transition focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-red-950"
              />
              <button
                type="submit"
                disabled={loading || !claim.trim()}
                className="absolute right-2.5 top-2 flex h-10 w-30 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700 disabled:opacity-50"
                aria-label="Lancer la vérification"
              >
                {loading ? (
                  <Sparkles size={18} className="animate-spin" />
                ) : (
                  <div className="flex justify-center items-center gap-2">
                    <div>
                      Lancer
                    </div>
                    <ArrowRight size={18} className=""/>
                  </div>
                )}
              </button>
            </div>

            {/* Suggestions en un clic */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-semibold text-gray-400">Exemples fréquents :</span>
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-gray-300 dark:hover:text-red-300"
                >
                  &laquo; {s.slice(0, 36)}… &raquo;
                </button>
              ))}
            </div>
          </form>

          {/* Animation pendant l'analyse */}
          {loading && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50/60 p-6 text-center dark:border-red-950/40 dark:bg-red-950/20">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300">
                <Sparkles size={24} className="animate-spin" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Analyse croisée en direct…
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Interrogation de Google &middot; Exploration des publications Facebook &middot; Calcul de la convergence des sources
              </p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Résultat de la vérification */}
        {result && verdictInfo && (
          <section className="mt-8 space-y-6">
            <div
              className={`rounded-2xl border p-6 shadow-sm transition ${verdictInfo.bgClass}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide shadow-sm ${verdictInfo.badgeClass}`}
                    >
                      <verdictInfo.icon size={14} />
                      {verdictInfo.title}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      &middot; {verdictInfo.label}
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-gray-950 dark:text-white">
                    &laquo; {result.claim_text} &raquo;
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {result.analysis_summary}
                  </p>
                </div>

                {/* Score de confiance
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-gray-200/60 pt-3 sm:border-0 sm:pt-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Confiance
                  </span>
                  <div className="text-2xl font-black text-gray-950 dark:text-white">
                    {confidencePercent}%
                  </div>
                  <div className="mt-1 h-2 w-28 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700">
                    <div
                      className="h-full rounded-full bg-red-600 transition-all duration-700"
                      style={{ width: `${confidencePercent}%` }}
                    />
                  </div>
                </div> */}
              </div>

              {/* Compteurs de sources */}
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-200/80 pt-4 dark:border-neutral-800">
                <div className="rounded-xl bg-white/80 p-3 text-center dark:bg-neutral-900/80">
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    Sources trouvées
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {result.sources_found}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-100/60 p-3 text-center dark:bg-emerald-950/40">
                  <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    Confirmantes
                  </p>
                  <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                    {result.sources_supporting}
                  </p>
                </div>
                <div className="rounded-xl bg-rose-100/60 p-3 text-center dark:bg-rose-950/40">
                  <p className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                    Contredisantes
                  </p>
                  <p className="text-lg font-black text-rose-700 dark:text-rose-400">
                    {result.sources_contradicting}
                  </p>
                </div>
              </div>
            </div>

            {/* Liste détaillée des sources analysées */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Sources et preuves analysées ({result.sources.length})
                </h3>
                <span className="text-xs text-gray-400">
                  Triées par pertinence
                </span>
              </div>

              <div className="space-y-3">
                {result.sources.map((src: VerificationSource) => {
                  const isFacebook = src.source_type?.toLowerCase() === "facebook";
                  return (
                    <div
                      key={src.id}
                      className="group rounded-xl border border-gray-100 p-4 transition hover:border-gray-300 hover:bg-gray-50/70 dark:border-neutral-800 dark:hover:bg-neutral-850"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                isFacebook
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300"
                              }`}
                            >
                              {isFacebook ? <FacebookIcon size={10} /> : <GoogleIcon size={10} />}
                              {src.source_type}
                            </span>

                            {src.supports_claim === true && (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <CheckCircle2 size={10} /> Confirme
                              </span>
                            )}
                            {src.supports_claim === false && (
                              <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                                <AlertOctagon size={10} /> Contredit
                              </span>
                            )}
                            {src.supports_claim === null && (
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-neutral-800 dark:text-gray-400">
                                Mention
                              </span>
                            )}

                            <span className="text-[10px] text-gray-400">
                              Pertinence: {Math.round(src.relevance_score * 100)}%
                            </span>
                          </div>

                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-red-600">
                            {src.title}
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                            {src.snippet}
                          </p>
                        </div>

                        {src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-white hover:text-red-600 dark:border-neutral-700 dark:hover:bg-neutral-800"
                            title="Consulter la source originale"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Historique des vérifications récentes */}
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <History size={18} className="text-red-600" />
              Dernières vérifications de la communauté
            </h3>
            {loadingHistory && (
              <span className="text-xs text-gray-400">Chargement…</span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => {
              const info = getVerdictInfo(item.verdict);
              return (
                <div
                  key={item.id}
                  onClick={() => setResult(item)}
                  className="flex cursor-pointer flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${info.badgeClass}`}
                      >
                        {info.title}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(item.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {item.claim_text}
                    </h4>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {item.analysis_summary}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-500 dark:border-neutral-800 dark:text-gray-400">
                    <span>{item.sources_found} sources</span>
                    <span className="font-semibold text-red-600 flex items-center gap-1 group-hover:translate-x-1">
                      Voir le rapport <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
