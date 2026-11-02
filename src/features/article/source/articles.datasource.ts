import { apiClient } from "@/core/api.client";
import type { ArticleItem } from "../domain/article.entity";

export interface ArticleQueryParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

interface ArticlesApiResponse {
  data?: ArticleItem[];
  articles?: ArticleItem[];
}

interface SingleArticleApiResponse {
  data?: ArticleItem;
  article?: ArticleItem;
}

function resolveEndpoint(path: string): string {
  const base = apiClient.defaults.baseURL || "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (base.endsWith("/api/v1") || base.includes("/api/v1")) {
    return cleanPath;
  }
  return `/api/v1${cleanPath}`;
}

export class ArticleDatasource {
  static async getAllArticle(params?: ArticleQueryParams): Promise<ArticleItem[]> {
    try {
      const response = await apiClient.get<ArticleItem[] | ArticlesApiResponse>(
        resolveEndpoint("/articles"),
        { params }
      );
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && typeof data === "object") {
        if ("data" in data && Array.isArray(data.data)) {
          return data.data;
        }
        if ("articles" in data && Array.isArray(data.articles)) {
          return data.articles;
        }
      }
      return [];
    } catch (error) {
      throw error;
    }
  }

  static async getArticleByID(id: number | string): Promise<ArticleItem> {
    try {
      const response = await apiClient.get<ArticleItem | SingleArticleApiResponse>(
        resolveEndpoint(`/articles/${id}`)
      );
      const data = response.data;
      if (data && typeof data === "object") {
        if ("data" in data && data.data) {
          return data.data;
        }
        if ("article" in data && data.article) {
          return data.article;
        }
      }
      return data as ArticleItem;
    } catch (error) {
      throw error;
    }
  }

  static getAllArticles = ArticleDatasource.getAllArticle;
  static getArticleById = ArticleDatasource.getArticleByID;
}
