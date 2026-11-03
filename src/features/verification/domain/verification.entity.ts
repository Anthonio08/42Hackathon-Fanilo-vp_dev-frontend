import type { OfficialAnalysis } from "./official-analysis";

export type VerificationVerdict =
  | "true"
  | "likely_true"
  | "false"
  | "likely_false"
  | "unverified"
  | "inconclusive"
  | "mixed"
  | string;

export interface VerificationSource {
  id: number;
  source_type: "google" | "facebook" | string;
  url: string;
  title: string;
  snippet: string;
  supports_claim: boolean | null;
  relevance_score: number;
}

export interface VerificationItem {
  id: number;
  claim_text: string;
  status: "completed" | "processing" | "failed" | string;
  verdict: VerificationVerdict;
  confidence_score: number;
  analysis_summary: string;
  sources_found: number;
  sources_supporting: number;
  sources_contradicting: number;
  sources: VerificationSource[];
  created_at: string;
  official_analysis?: OfficialAnalysis;
}

export interface VerifyClaimRequest {
  claim: string;
}

export interface VerificationListResponse {
  total: number;
  page: number;
  per_page: number;
  verifications: VerificationItem[];
}

