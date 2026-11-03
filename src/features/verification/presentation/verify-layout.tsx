"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ExternalLink, Loader2, Search } from "lucide-react";
import { verificationRepository } from "../repository/verification.repository";
import type {
  VerificationItem,
  VerificationSource,
  VerificationVerdict,
} from "../domain/verification.entity";
import {
  analyzeOfficialStatus,
  isSourceOfficial,
  type OfficialAnalysis,
} from "../domain/official-analysis";
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
      title: "Information confirmée",
      label: "Fait vérifié",
      badgeClass:
        "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      dotClass: "bg-emerald-600",
      accentBorder: "border-l-4 border-l-emerald-600",
    };
  }
  if (v === "false" || v === "likely_false") {
    return {
      title: "Information réfutée",
      label: "Faux / Rumeur infondée",
      badgeClass:
        "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
      dotClass: "bg-rose-600",
      accentBorder: "border-l-4 border-l-rose-600",
    };
  }
  if (v === "mixed") {
    return {
      title: "Avis partagés",
      label: "Éléments contradictoires",
      badgeClass:
        "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
      dotClass: "bg-gray-600",
      accentBorder: "border-l-4 border-l-gray-600",
    };
  }
  return {
    title: "Non vérifié",
    label: "Sources insuffisantes",
    badgeClass:
      "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
    dotClass: "bg-gray-400",
    accentBorder: "border-l-4 border-l-gray-300 dark:border-l-neutral-700",
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
  const officialAnalysis: OfficialAnalysis | null = result
    ? result.official_analysis || analyzeOfficialStatus(result)
    : null;

  return (
    <main className="w-full pb-16 pt-8">
      <div className="mx-auto w-full max-w-7xl px-6">
        <TitleComponent
          title="Vérificateur d'Informations"
          description="Soumettez une rumeur, déclaration ou affirmation. Notre moteur consulte les sources d'actualités et publications publiques pour analyser la concordance des faits."
        />

        {/* Formulaire de vérification */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="flex flex-col gap-4"
          >
            <label
              htmlFor="claim-input"
              className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
            >
              Affirmation ou rumeur à vérifier :
            </label>
            <div className="relative">
              <input
                id="claim-input"
                type="text"
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="Ex : Mickael Randrianirina est président de la république…"
                className="w-full rounded-xl border border-gray-300 bg-white p-3.5 pr-28 text-sm text-gray-900 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading || !claim.trim()}
                className="absolute right-2 top-2 flex h-9 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                aria-label="Lancer la vérification"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Analyse…</span>
                  </>
                ) : (
                  <>
                    <Search size={14} />
                    <span>Vérifier</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggestions en un clic */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-gray-400">Exemples :</span>
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 transition hover:border-gray-400 hover:bg-gray-100 dark:border-neutral-800 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-750"
                >
                  &laquo; {s.slice(0, 36)}… &raquo;
                </button>
              ))}
            </div>
          </form>

          {/* État de chargement sobre */}
          {loading && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/80 p-5 text-center dark:border-neutral-800 dark:bg-neutral-850">
              <Loader2 size={20} className="mx-auto mb-2 animate-spin text-gray-600 dark:text-gray-300" />
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                Croisement des sources en cours…
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                Interrogation des articles de presse et des déclarations publiques
              </p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Résultat de la vérification */}
        {result && verdictInfo && officialAnalysis && (
          <section className="mt-8 space-y-6">
            <div
              className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 ${verdictInfo.accentBorder}`}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${verdictInfo.badgeClass}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${verdictInfo.dotClass}`} />
                    {verdictInfo.title}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${officialAnalysis.badge_class}`}
                  >
                    {officialAnalysis.badge_title}
                  </span>

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    &middot; {verdictInfo.label}
                  </span>
                </div>

                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  &laquo; {result.claim_text} &raquo;
                </h2>

                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {result.analysis_summary}
                </p>
              </div>

              {/* Encadré d'officialité sobre */}
              <div
                className={`mt-5 rounded-xl border p-4 ${officialAnalysis.bg_class} ${officialAnalysis.border_class}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                        {officialAnalysis.label}
                      </h4>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        ({officialAnalysis.official_sources_count} source{officialAnalysis.official_sources_count > 1 ? "s" : ""} officielle{officialAnalysis.official_sources_count > 1 ? "s" : ""})
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      {officialAnalysis.summary}
                    </p>
                  </div>

                  <div className="shrink-0 border-t border-gray-200/60 pt-2 sm:border-0 sm:pt-0 sm:text-right">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Indice de confirmation
                    </span>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {officialAnalysis.official_score}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistiques des résultats - Design sobre et accessible */}
              <div className="mt-5 border-t border-gray-100 pt-4 dark:border-neutral-800">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Statistiques des résultats
                  </span>
                  <span className="text-xs text-gray-400">
                    {officialAnalysis.web_links_count} sources web &middot; {officialAnalysis.facebook_links_count} réseaux
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-gray-200/80 bg-gray-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-850">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Liens analysés
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {officialAnalysis.total_links_count}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Google &amp; Facebook
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200/80 bg-gray-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-850">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Sources officielles
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {officialAnalysis.official_sources_count}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Institutions &amp; presse
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200/80 bg-gray-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-850">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Concordantes
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {officialAnalysis.corroborating_links_count}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Confirmations
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200/80 bg-gray-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-850">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Contredisantes
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {officialAnalysis.contradicting_links_count}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Contestations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des sources */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Sources et pièces consultées ({result.sources.length})
                </h3>
                <span className="text-xs text-gray-400">
                  Classées par pertinence
                </span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                {result.sources.map((src: VerificationSource) => {
                  const isOfficial = isSourceOfficial(src);
                  return (
                    <div key={src.id} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                              {src.source_type}
                            </span>

                            {isOfficial && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-neutral-800 dark:text-slate-300">
                                Source officielle
                              </span>
                            )}

                            {src.supports_claim === true && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                Confirme
                              </span>
                            )}
                            {src.supports_claim === false && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 dark:text-rose-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                                Contredit
                              </span>
                            )}
                            {src.supports_claim === null && (
                              <span className="text-[11px] text-gray-400">
                                Mention
                              </span>
                            )}

                            <span className="text-[11px] text-gray-400">
                              &middot; Pertinence {Math.round(src.relevance_score * 100)}%
                            </span>
                          </div>

                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
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
                            className="shrink-0 rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-neutral-800 dark:hover:text-white"
                            title="Consulter la source"
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
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Vérifications récentes
            </h3>
            {loadingHistory && (
              <span className="text-xs text-gray-400">Chargement…</span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => {
              const info = getVerdictInfo(item.verdict);
              const itemOfficial = item.official_analysis || analyzeOfficialStatus(item);
              return (
                <div
                  key={item.id}
                  onClick={() => setResult(item)}
                  className="flex cursor-pointer flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-xs transition hover:border-gray-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${info.badgeClass}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${info.dotClass}`} />
                        {info.title}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(item.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {item.claim_text}
                    </h4>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {item.analysis_summary}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-500 dark:border-neutral-800 dark:text-gray-400">
                    <span>
                      {itemOfficial.total_links_count} sources &middot; {itemOfficial.official_sources_count} off.
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                      Consulter <ArrowRight size={11} />
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
