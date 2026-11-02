export type ArticleStatus =
  | "pending"
  | "verified"
  | "fake"
  | "unverified"
  | "published"
  | "rejected"
  | string;

export interface ArticleItem {
  id: number;
  title: string;
  content: string;
  source: string;
  source_url: string;
  author: string | null;
  image_url: string | null;
  status: ArticleStatus;
  collected_by_id: number | null;
  published_at: string | null;
  collected_at: string;
  created_at: string;

  // Champs optionnels pour compatibilité d'affichage UI
  description?: string;
  image?: string;
  category?: string;
  date?: string;
  color?: "red" | "blue" | "yellow" | "purple" | "green";
  nbComs?: number;
}

export class ArticleItemModel implements ArticleItem {
  id: number;
  title: string;
  content: string;
  source: string;
  source_url: string;
  author: string | null;
  image_url: string | null;
  status: ArticleStatus;
  collected_by_id: number | null;
  published_at: string | null;
  collected_at: string;
  created_at: string;

  description?: string;
  image?: string;
  category?: string;
  date?: string;
  color?: "red" | "blue" | "yellow" | "purple" | "green";
  nbComs?: number;

  constructor(data: Partial<ArticleItem> & { id: number; title: string }) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content || "";
    this.source = data.source || "unknown";
    this.source_url = data.source_url || "";
    this.author = data.author ?? null;
    this.image_url = data.image_url ?? null;
    this.status = data.status || "pending";
    this.collected_by_id = data.collected_by_id ?? null;
    this.published_at = data.published_at ?? null;
    this.collected_at = data.collected_at || new Date().toISOString();
    this.created_at = data.created_at || new Date().toISOString();

    this.description = data.description || this.content;
    this.image = data.image || this.image_url || "/login-hero.jpg";
    this.category = data.category || this.source;
    this.date = data.date || this.formatDate(this.created_at);
    this.color = data.color || "blue";
    this.nbComs = data.nbComs ?? 0;
  }

  private formatDate(dateStr?: string | null): string {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  static fromJson(json: Record<string, unknown>): ArticleItemModel {
    return new ArticleItemModel({
      id: Number(json.id) || 0,
      title: String(json.title || ""),
      content: String(json.content || ""),
      source: String(json.source || ""),
      source_url: String(json.source_url || ""),
      author: (json.author as string) ?? null,
      image_url: (json.image_url as string) ?? null,
      status: (json.status as ArticleStatus) || "pending",
      collected_by_id:
        json.collected_by_id !== null && json.collected_by_id !== undefined
          ? Number(json.collected_by_id)
          : null,
      published_at: (json.published_at as string) ?? null,
      collected_at: String(json.collected_at || ""),
      created_at: String(json.created_at || ""),
    });
  }
}

