import type {
  VerificationItem,
  VerificationSource,
} from "./verification.entity";

export type OfficialStatusType =
  | "official_confirmed"
  | "high_corroboration"
  | "pending_official"
  | "officially_refuted";

export interface OfficialAnalysis {
  is_official: boolean;
  status: OfficialStatusType;
  label: string;
  badge_title: string;
  badge_class: string;
  border_class: string;
  bg_class: string;
  text_class: string;
  official_sources_count: number;
  total_links_count: number;
  corroborating_links_count: number;
  contradicting_links_count: number;
  facebook_links_count: number;
  web_links_count: number;
  official_score: number;
  summary: string;
  official_sources: VerificationSource[];
}

const INSTITUTIONAL_DOMAINS = [
  "gov.mg",
  "gouv.mg",
  "hcc.gov.mg",
  "presidence.gov.mg",
  "primature.gov.mg",
  "assemblee-nationale.mg",
  "senat.mg",
  "meteo.mg",
  "jirama.mg",
  "banque-centrale.mg",
  "police.mg",
  "gendarmerie.mg",
  "un.org",
  "who.int",
  "worldbank.org",
  "unesco.org",
  "la1ere.franceinfo.fr",
  "franceinfo.fr",
  "lemonde.fr",
  "bbc.com",
  "africanews.com",
  "rfi.fr",
  "afp.com",
  "lefigaro.fr",
  "leparisien.fr",
  "lexpress.mg",
  "midi-madagasikara.mg",
  "newsmada.com",
  "2424.mg",
  "actutana.com",
  "madagascar-tribune.com",
  "wikipedia.org",
];

const OFFICIAL_KEYWORDS = [
  "officiel",
  "officielle",
  "officiellement",
  "décret",
  "decret",
  "arrêté",
  "arrete",
  "communiqué officiel",
  "communique officiel",
  "investiture",
  "prêté serment",
  "prete serment",
  "haute cour constitutionnelle",
  "hcc",
  "ministère",
  "ministere",
  "présidence",
  "presidence",
  "porte-parole",
  "conseil des ministres",
  "conférence de presse",
  "conference de presse",
  "journal officiel",
  "ordonnance",
  "décision",
  "declaration officielle",
];

/**
 * Détermine si une source donnée est officielle ou institutionnelle
 */
export function isSourceOfficial(src: VerificationSource): boolean {
  if (!src) return false;

  const urlLower = (src.url || "").toLowerCase();
  const domainMatch = INSTITUTIONAL_DOMAINS.some((domain) =>
    urlLower.includes(domain.toLowerCase())
  );
  if (domainMatch) return true;

  const textToCheck = `${src.title || ""} ${src.snippet || ""}`.toLowerCase();
  return OFFICIAL_KEYWORDS.some((kw) => textToCheck.includes(kw));
}

/**
 * Analyse l'officialité d'un résultat de vérification en fonction du volume de liens et de sources
 */
export function analyzeOfficialStatus(item: VerificationItem): OfficialAnalysis {
  const sources = Array.isArray(item.sources) ? item.sources : [];
  const total_links_count = Math.max(item.sources_found || 0, sources.length);

  const official_sources = sources.filter(isSourceOfficial);
  const official_sources_count = official_sources.length;

  const facebook_links_count = sources.filter(
    (s) => s.source_type?.toLowerCase() === "facebook"
  ).length;
  const web_links_count = sources.filter(
    (s) => s.source_type?.toLowerCase() !== "facebook"
  ).length;

  const corroborating_links_count = Math.max(
    item.sources_supporting || 0,
    sources.filter((s) => s.supports_claim === true).length
  );
  const contradicting_links_count = Math.max(
    item.sources_contradicting || 0,
    sources.filter((s) => s.supports_claim === false).length
  );

  const verdictLower = (item.verdict || "").toLowerCase();
  const isRefuted =
    verdictLower === "false" ||
    verdictLower === "likely_false" ||
    (contradicting_links_count > corroborating_links_count && contradicting_links_count > 0);

  let status: OfficialStatusType = "pending_official";
  let is_official = false;
  let label = "Non officialisé (absence d'acte d'État)";
  let badge_title = "Non officialisé";
  let badge_class =
    "bg-neutral-100 text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700";
  let border_class = "border-gray-200 dark:border-neutral-800";
  let bg_class = "bg-gray-50/70 dark:bg-neutral-850/60";
  let text_class = "text-gray-900 dark:text-white";
  let summary = `Aucune source institutionnelle officielle (0/${total_links_count}) n'atteste encore de cette déclaration. L'information circule principalement comme rumeur sans communiqué étatique.`;
  let official_score = 30;

  if (isRefuted) {
    status = "officially_refuted";
    is_official = false;
    label = "Démenti officiel / Information réfutée";
    badge_title = "Démenti officiel";
    badge_class =
      "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900";
    border_class = "border-gray-200 dark:border-neutral-800";
    bg_class = "bg-gray-50/70 dark:bg-neutral-850/60";
    text_class = "text-gray-900 dark:text-white";
    summary = `Cette information a été réfutée par les recoupements officiels (${contradicting_links_count} source(s) contradictoire(s) sur ${total_links_count} liens analysés).`;
    official_score = 15;
  } else if (
    official_sources_count >= 1 &&
    (verdictLower === "true" ||
      verdictLower === "likely_true" ||
      corroborating_links_count >= 1)
  ) {
    status = "official_confirmed";
    is_official = true;
    label = "Information officiellement confirmée";
    badge_title = "Déjà officialisé";
    badge_class =
      "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900";
    border_class = "border-gray-200 dark:border-neutral-800";
    bg_class = "bg-gray-50/70 dark:bg-neutral-850/60";
    text_class = "text-gray-900 dark:text-white";
    summary = `L'information est attestée par ${official_sources_count} source(s) institutionnelle(s) ou médias de référence parmi ${total_links_count} liens consultés.`;
    official_score = Math.min(98, 80 + official_sources_count * 4);
  } else if (
    corroborating_links_count >= 2 ||
    (total_links_count >= 4 && corroborating_links_count >= 1)
  ) {
    status = "high_corroboration";
    is_official = true;
    label = "Forte convergence des sources de presse";
    badge_title = "Sources concordantes";
    badge_class =
      "bg-slate-100 text-slate-800 border border-slate-300 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700";
    border_class = "border-gray-200 dark:border-neutral-800";
    bg_class = "bg-gray-50/70 dark:bg-neutral-850/60";
    text_class = "text-gray-900 dark:text-white";
    summary = `Statistiques concluantes : ${corroborating_links_count} sources concordantes sur ${total_links_count} liens soutiennent l'affirmation.`;
    official_score = Math.min(88, 65 + corroborating_links_count * 5);
  }

  return {
    is_official,
    status,
    label,
    badge_title,
    badge_class,
    border_class,
    bg_class,
    text_class,
    official_sources_count,
    total_links_count,
    corroborating_links_count,
    contradicting_links_count,
    facebook_links_count,
    web_links_count,
    official_score,
    summary,
    official_sources,
  };
}

