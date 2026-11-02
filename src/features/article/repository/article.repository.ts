import { articles } from "@/features/home/infrastructure/data";
import {
  ArticleDatasource,
  ArticleQueryParams,
} from "../source/articles.datasource";
import type { ArticleItem, ArticleStatus } from "../domain/article.entity";

export interface ArticleRepository {
  getAll(params?: ArticleQueryParams): Promise<ArticleItem[]>;
  getAllArticle(params?: ArticleQueryParams): Promise<ArticleItem[]>;
  getAllArticles(params?: ArticleQueryParams): Promise<ArticleItem[]>;
  getById(id: number | string): Promise<ArticleItem | undefined>;
  getArticleById(id: number | string): Promise<ArticleItem | undefined>;
  getArticleByID(id: number | string): Promise<ArticleItem | undefined>;
  getByCategory(category: string): Promise<ArticleItem[]>;
}

export class ArticleRepositoryImpl implements ArticleRepository {
  async getAll(params?: ArticleQueryParams): Promise<ArticleItem[]> {
    try {
      const data = await ArticleDatasource.getAllArticle(params);
      if (Array.isArray(data) && data.length > 0) {
        let normalized = data.map((item, idx) =>
          this.normalizeRemoteArticle(item, idx)
        );

        if (params?.status && params.status !== "Tous" && params.status !== "all") {
          normalized = normalized.filter(
            (item) => item.status?.toLowerCase() === params.status?.toLowerCase()
          );
        }

        if (params?.category && params.category !== "Tous") {
          normalized = normalized.filter(
            (item) =>
              item.category?.toLowerCase() === params.category?.toLowerCase() ||
              item.source.toLowerCase() === params.category?.toLowerCase()
          );
        }

        if (params?.search) {
          const query = params.search.toLowerCase();
          normalized = normalized.filter(
            (item) =>
              item.title.toLowerCase().includes(query) ||
              item.content.toLowerCase().includes(query) ||
              (item.description && item.description.toLowerCase().includes(query))
          );
        }

        return normalized;
      }
      return this.getLocalArticles(params);
    } catch (error) {
      console.warn(
        "API non joignable ou erreur lors du chargement des articles, utilisation des données locales:",
        error
      );
      return this.getLocalArticles(params);
    }
  }

  async getAllArticle(params?: ArticleQueryParams): Promise<ArticleItem[]> {
    return this.getAll(params);
  }

  async getAllArticles(params?: ArticleQueryParams): Promise<ArticleItem[]> {
    return this.getAll(params);
  }

  async getById(id: number | string): Promise<ArticleItem | undefined> {
    try {
      const data = await ArticleDatasource.getArticleByID(id);
      if (data) {
        return this.normalizeRemoteArticle(data, 0);
      }
      return this.getLocalArticleById(id);
    } catch (error) {
      console.warn(
        `API non joignable pour l'article ${id}, recherche dans les données locales:`,
        error
      );
      return this.getLocalArticleById(id);
    }
  }

  async getArticleById(id: number | string): Promise<ArticleItem | undefined> {
    return this.getById(id);
  }

  async getArticleByID(id: number | string): Promise<ArticleItem | undefined> {
    return this.getById(id);
  }

  async getByCategory(category: string): Promise<ArticleItem[]> {
    return this.getAll({ category });
  }

  private inferCategory(title = "", content = ""): string {
    const text = `${title} ${content}`.toLowerCase();
    if (
      /incendie|feu|pompier|secours|braquage|attaque|police|gendarme|vol|émeute|agression|prison|arme|sécurité/.test(
        text
      )
    ) {
      return "Sécurité";
    }
    if (
      /route|accident|circulation|embouteillage|taxi|bus|train|transport|véhicule|camion|pont/.test(
        text
      )
    ) {
      return "Transport";
    }
    if (
      /météo|pluie|cyclone|orage|tempête|inondation|climat|chaleur|sécheresse|vent/.test(
        text
      )
    ) {
      return "Météo";
    }
    if (
      /santé|hôpital|médecin|paludisme|peste|épidémie|vaccin|eau potable|maladie|urgence/.test(
        text
      )
    ) {
      return "Santé";
    }
    if (
      /grève|manifestation|concert|match|festival|célébration|foire|élection|conférence|évènement|événement/.test(
        text
      )
    ) {
      return "Événement";
    }
    return "Autres";
  }

  private categoryColor(
    cat: string
  ): "red" | "blue" | "yellow" | "purple" | "green" {
    switch (cat) {
      case "Sécurité":
        return "red";
      case "Transport":
        return "yellow";
      case "Météo":
        return "blue";
      case "Santé":
        return "green";
      case "Événement":
        return "purple";
      default:
        return "blue";
    }
  }

  private normalizeRemoteArticle(raw: ArticleItem, index: number): ArticleItem {
    const title = raw.title || "Actualité";
    const content = raw.content || raw.description || "";
    const category =
      raw.category || this.inferCategory(title, content) || "Sécurité";
    const color = raw.color || this.categoryColor(category);

    const formattedDate =
      raw.date ||
      (raw.published_at || raw.created_at
        ? new Date(raw.published_at || raw.created_at).toLocaleDateString(
            "fr-FR",
            { day: "numeric", month: "short", year: "numeric" }
          )
        : "Récemment");

    const image = raw.image || raw.image_url || "/login-hero.jpg";

    const nbComs =
      typeof raw.nbComs === "number"
        ? raw.nbComs
        : ((typeof raw.id === "number" ? raw.id : index) * 7) % 23 + 4;

    const paragraphs =
      raw.paragraphs && raw.paragraphs.length > 0
        ? raw.paragraphs
        : content
        ? content.split("\n\n").filter(Boolean)
        : [title];

    return {
      ...raw,
      id: raw.id ?? index + 1,
      title,
      content,
      description: raw.description || content,
      category,
      color,
      image,
      image_url: raw.image_url || image,
      date: formattedDate,
      nbComs,
      paragraphs,
      source: raw.source || "Google",
      status: raw.status || "pending",
    };
  }

  private getLocalArticles(params?: ArticleQueryParams): ArticleItem[] {
    const sampleStatuses: ArticleStatus[] = [
      "verified",
      "fake",
      "verified",
      "unverified",
      "pending",
      "verified",
      "fake",
    ];

    let result: ArticleItem[] = articles.map((item, index) => ({
      id: typeof item.id === "number" ? item.id : index + 1,
      title: item.title,
      content: item.description,
      source: item.category,
      source_url: "",
      author: null,
      image_url: item.image,
      status: sampleStatuses[index % sampleStatuses.length],
      collected_by_id: 1,
      published_at: item.date,
      collected_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      // Compatibilité UI
      description: item.description,
      image: item.image,
      category: item.category,
      color: item.color,
      date: item.date,
      nbComs: item.nbComs,
    }));

    if (params?.status && params.status !== "Tous") {
      result = result.filter(
        (item) => item.status?.toLowerCase() === params.status?.toLowerCase()
      );
    }

    if (params?.category && params.category !== "Tous") {
      result = result.filter(
        (item) =>
          item.category?.toLowerCase() === params.category?.toLowerCase() ||
          item.source.toLowerCase() === params.category?.toLowerCase()
      );
    }

    if (params?.search) {
      const query = params.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
      );
    }

    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      result = result.slice(start, start + params.limit);
    }

    return result;
  }

  private getLocalArticleById(id: number | string): ArticleItem | undefined {
    const localList = this.getLocalArticles();
    const numId = Number(id);

    if (!isNaN(numId)) {
      const found = localList.find((item) => item.id === numId);
      if (found) return found;
    }

    return localList.find(
      (item) => item.title.toLowerCase() === String(id).toLowerCase()
    );
  }
}

// Instance par défaut prête à l'emploi
export const articleRepository: ArticleRepository = new ArticleRepositoryImpl();
export type { ArticleItem };
