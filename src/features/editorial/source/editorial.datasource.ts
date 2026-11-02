import { apiClient, resolveEndpoint } from "@/core/api.client";
import type {
  EditorialArticle,
  EditorialListResponse,
  EditorialListParams,
  EditorialStats,
  EditorialReview,
  CreateEditorialRequest,
  UpdateEditorialRequest,
  GenerateDraftRequest,
  ReviewDecision,
} from "../domain/editorial.entity";

export class EditorialDatasource {
  /**
   * Créer un nouvel article éditorial
   * POST /api/v1/editorial/articles
   */
  static async createArticle(data: CreateEditorialRequest): Promise<EditorialArticle> {
    const response = await apiClient.post<EditorialArticle>(
      resolveEndpoint("/editorial/articles"),
      data
    );
    return response.data;
  }

  /**
   * Lister les articles éditoriaux avec filtres et pagination
   * GET /api/v1/editorial/articles
   */
  static async listArticles(params?: EditorialListParams): Promise<EditorialListResponse> {
    const response = await apiClient.get<EditorialListResponse>(
      resolveEndpoint("/editorial/articles"),
      {
        params,
      }
    );
    return response.data;
  }

  /**
   * Générer un brouillon d'article via l'IA
   * POST /api/v1/editorial/generate-draft
   */
  static async generateDraft(data: GenerateDraftRequest): Promise<EditorialArticle> {
    const response = await apiClient.post<EditorialArticle>(
      resolveEndpoint("/editorial/generate-draft"),
      data
    );
    return response.data;
  }

  /**
   * Récupérer les statistiques éditoriales
   * GET /api/v1/editorial/stats
   */
  static async getStats(): Promise<EditorialStats> {
    const response = await apiClient.get<EditorialStats>(
      resolveEndpoint("/editorial/stats")
    );
    return response.data;
  }

  /**
   * Récupérer un article par ID ou slug
   * GET /api/v1/editorial/articles/{identifier}
   */
  static async getArticle(identifier: string | number): Promise<EditorialArticle> {
    const response = await apiClient.get<EditorialArticle>(
      resolveEndpoint(`/editorial/articles/${identifier}`)
    );
    return response.data;
  }

  /**
   * Mettre à jour un article éditorial
   * PUT /api/v1/editorial/articles/{id}
   */
  static async updateArticle(id: number, data: UpdateEditorialRequest): Promise<EditorialArticle> {
    const response = await apiClient.put<EditorialArticle>(
      resolveEndpoint(`/editorial/articles/${id}`),
      data
    );
    return response.data;
  }

  /**
   * Supprimer un article éditorial
   * DELETE /api/v1/editorial/articles/{id}
   */
  static async deleteArticle(id: number): Promise<void> {
    await apiClient.delete(
      resolveEndpoint(`/editorial/articles/${id}`)
    );
  }

  /**
   * Soumettre un article pour révision
   * POST /api/v1/editorial/articles/{id}/submit
   */
  static async submitArticle(id: number): Promise<EditorialArticle> {
    const response = await apiClient.post<EditorialArticle>(
      resolveEndpoint(`/editorial/articles/${id}/submit`)
    );
    return response.data;
  }

  /**
   * Réviser un article (approuver/rejeter)
   * POST /api/v1/editorial/articles/{id}/review
   */
  static async reviewArticle(id: number, data: ReviewDecision): Promise<EditorialArticle> {
    const response = await apiClient.post<EditorialArticle>(
      resolveEndpoint(`/editorial/articles/${id}/review`),
      data
    );
    return response.data;
  }

  /**
   * Publier un article approuvé
   * POST /api/v1/editorial/articles/{id}/publish
   */
  static async publishArticle(id: number): Promise<EditorialArticle> {
    const response = await apiClient.post<EditorialArticle>(
      resolveEndpoint(`/editorial/articles/${id}/publish`)
    );
    return response.data;
  }

  /**
   * Archiver un article
   * POST /api/v1/editorial/articles/{id}/archive
   */
  static async archiveArticle(id: number): Promise<EditorialArticle> {
    const response = await apiClient.post<EditorialArticle>(
      resolveEndpoint(`/editorial/articles/${id}/archive`)
    );
    return response.data;
  }

  /**
   * Ajouter un commentaire sur un article
   * POST /api/v1/editorial/articles/{articleId}/comments
   */
  static async addComment(articleId: number, comment: string): Promise<EditorialReview> {
    const response = await apiClient.post<EditorialReview>(
      resolveEndpoint(`/editorial/articles/${articleId}/comments`),
      { comment }
    );
    return response.data;
  }

  /**
   * Récupérer les commentaires d'un article
   * GET /api/v1/editorial/articles/{articleId}/comments
   */
  static async getComments(articleId: number): Promise<EditorialReview[]> {
    const response = await apiClient.get<EditorialReview[]>(
      resolveEndpoint(`/editorial/articles/${articleId}/comments`)
    );
    return response.data;
  }
}
