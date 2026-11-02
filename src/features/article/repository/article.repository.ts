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
        return data;
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
        return data;
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
