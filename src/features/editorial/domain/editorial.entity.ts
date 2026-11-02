export type EditorialStatus = "draft" | "in_review" | "approved" | "rejected" | "published" | "archived";

export type EditorialCategory = "politique" | "sante" | "economie" | "societe" | "science_tech" | "environnement" | "international" | "general";

export type EditorialRating = "true" | "mostly_true" | "half_true" | "misleading" | "false" | "unproven" | "satire" | string;

export interface EditorialArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  fact_check_claim: string | null;
  editorial_rating: EditorialRating | null;
  category: EditorialCategory;
  tags: string | null;
  featured_image_url: string | null;
  status: EditorialStatus;
  author_id: number;
  reviewer_id: number | null;
  linked_news_id: number | null;
  linked_verification_id: number | null;
  review_feedback: string | null;
  is_featured: boolean;
  views_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  reviews?: EditorialReview[];
}

export interface EditorialReview {
  id: number;
  article_id: number;
  user_id: number;
  action: string;
  comment: string;
  created_at: string;
}

export interface EditorialListResponse {
  total: number;
  page: number;
  per_page: number;
  articles: EditorialArticle[];
}

export interface EditorialStats {
  total_articles: number;
  drafts_count: number;
  in_review_count: number;
  approved_count: number;
  published_count: number;
  archived_count: number;
  total_views: number;
  category_breakdown: Record<string, number>;
  rating_breakdown: Record<string, number>;
}

export interface CreateEditorialRequest {
  title: string;
  summary: string;
  content: string;
  fact_check_claim?: string;
  editorial_rating?: EditorialRating;
  category?: EditorialCategory;
  tags?: string;
  featured_image_url?: string;
  linked_news_id?: number;
  linked_verification_id?: number;
  is_featured?: boolean;
}

export interface UpdateEditorialRequest extends Partial<CreateEditorialRequest> {
  is_featured?: boolean;
}

export interface GenerateDraftRequest {
  news_id?: number;
  verification_id?: number;
  source_url?: string;
  topic?: string;
  category?: EditorialCategory;
}

export interface ReviewDecision {
  decision: string;
  feedback: string;
}

export interface EditorialListParams {
  page?: number;
  per_page?: number;
  status?: EditorialStatus;
  category?: EditorialCategory;
  rating?: EditorialRating;
  author_id?: number;
  is_featured?: boolean;
  search?: string;
  sort_by?: "recent" | "views" | "published";
}
