import { apiClient, resolveEndpoint } from "@/core/api.client";
import type { ArticleItem, ArticleStatus } from "../domain/article.entity";

export interface CollectNewsRequest {
  query: string;
  num_results?: number;
  source?: "all" | "google" | "facebook" | string;
}

export interface CollectNewsResponse {
  collected_count: number;
  articles: ArticleItem[];
  query: string;
}

export interface ListNewsParams {
  page?: number;
  per_page?: number;
  status?: ArticleStatus;
}

export interface ListNewsResponse {
  total: number;
  page: number;
  per_page: number;
  articles: ArticleItem[];
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  source_url?: string;
  author?: string;
  image_url?: string;
}

export class NewsDatasource {
  /**
   * Rechercher en plein texte dans les news stockées en base
   * GET /api/v1/news/search?q={query}&page={page}&per_page={per_page}
   */
  static async search(
    query: string,
    page = 1,
    perPage = 20
  ): Promise<ListNewsResponse> {
    const response = await apiClient.get<ListNewsResponse>(
      resolveEndpoint("/news/search"),
      {
        params: {
          q: query,
          page,
          per_page: perPage,
        },
      }
    );
    return response.data;
  }

  /**
   * Collecter des news depuis Google et Facebook en temps réel
   * POST /api/v1/news/collect
   */
  static async collect(
    data: CollectNewsRequest
  ): Promise<CollectNewsResponse> {
    const response = await apiClient.post<CollectNewsResponse>(
      resolveEndpoint("/news/collect"),
      {
        query: data.query,
        num_results: data.num_results ?? 10,
        source: data.source ?? "all",
      }
    );
    return response.data;
  }

  /**
   * Lister toutes les news collectées avec pagination et statut
   * GET /api/v1/news/?page={page}&per_page={per_page}&status={status}
   */
  static async list(params?: ListNewsParams): Promise<ListNewsResponse> {
    const response = await apiClient.get<ListNewsResponse>(
      resolveEndpoint("/news/"),
      {
        params: {
          page: params?.page ?? 1,
          per_page: params?.per_page ?? 20,
          status: params?.status,
        },
      }
    );
    return response.data;
  }

  /**
   * Récupérer le détail d'une news par son ID
   * GET /api/v1/news/{article_id}
   */
  static async getById(articleId: number | string): Promise<ArticleItem> {
    const response = await apiClient.get<ArticleItem>(
      resolveEndpoint(`/news/${articleId}`)
    );
    return response.data;
  }

  /**
   * Ajouter une news manuellement
   * POST /api/v1/news/
   */
  static async create(data: CreateNewsRequest): Promise<ArticleItem> {
    const response = await apiClient.post<ArticleItem>(
      resolveEndpoint("/news/"),
      data
    );
    return response.data;
  }

  /**
   * Mettre à jour le statut d'un article (pending, verified, fake, unverified)
   * PATCH /api/v1/news/{article_id}/status?new_status={new_status}
   */
  static async updateStatus(
    articleId: number | string,
    newStatus: "pending" | "verified" | "fake" | "unverified" | string
  ): Promise<ArticleItem> {
    const response = await apiClient.patch<ArticleItem>(
      resolveEndpoint(`/news/${articleId}/status`),
      null,
      {
        params: {
          new_status: newStatus,
        },
      }
    );
    return response.data;
  }

  /**
   * Supprimer un article par ID
   * DELETE /api/v1/news/{article_id}
   */
  static async delete(articleId: number | string): Promise<void> {
    await apiClient.delete(resolveEndpoint(`/news/${articleId}`));
  }
}

