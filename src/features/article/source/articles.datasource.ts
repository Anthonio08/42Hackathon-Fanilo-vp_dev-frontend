import { apiClient, resolveEndpoint } from "@/core/api.client";
import type { ArticleItem } from "../domain/article.entity";
import { NewsDatasource } from "./news.datasource";

export interface ArticleQueryParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
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

export class ArticleDatasource {
  static async getAllArticle(params?: ArticleQueryParams): Promise<ArticleItem[]> {
    try {
      // Essaye d'abord l'endpoint /news/
      try {
        // Si une page précise et une limite sont demandées
        if (typeof params?.page === "number" && typeof params?.limit === "number") {
          const newsList = await NewsDatasource.list({
            page: params.page,
            per_page: Math.min(100, params.limit),
            status:
              typeof params?.status === "string" &&
              params.status !== "all" &&
              params.status !== "Tous"
                ? params.status
                : undefined,
          });
          if (newsList && Array.isArray(newsList.articles)) {
            return newsList.articles;
          }
        }

        // Sinon, récupérer l'ensemble des articles disponibles en base (par pages de 100)
        let allArticles: ArticleItem[] = [];
        let currentPage = 1;
        let total = 0;
        const maxPages = 5; // Récupère jusqu'à 500 articles

        do {
          const newsList = await NewsDatasource.list({
            page: currentPage,
            per_page: 100,
            status:
              typeof params?.status === "string" &&
              params.status !== "all" &&
              params.status !== "Tous"
                ? params.status
                : undefined,
          });

          if (newsList && Array.isArray(newsList.articles) && newsList.articles.length > 0) {
            allArticles = allArticles.concat(newsList.articles);
            total = newsList.total || allArticles.length;
          } else {
            break;
          }
          currentPage++;
        } while (allArticles.length < total && currentPage <= maxPages);

        if (allArticles.length > 0) {
          return allArticles;
        }
      } catch {
        // Continue sur /articles si /news/ échoue
      }

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
      try {
        const item = await NewsDatasource.getById(id);
        if (item && item.id !== undefined) {
          return item;
        }
      } catch {
        // Continue sur /articles/${id}
      }

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

export { NewsDatasource };
