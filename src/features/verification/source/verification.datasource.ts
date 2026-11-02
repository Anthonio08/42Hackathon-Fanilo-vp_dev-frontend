import { apiClient, resolveEndpoint } from "@/core/api.client";
import type {
  VerificationItem,
  VerificationListResponse,
} from "../domain/verification.entity";

export class VerificationDatasource {
  /**
   * Vérifier une information / affirmation en direct via Google et Facebook
   * POST /api/v1/verification/verify
   */
  static async verify(claim: string): Promise<VerificationItem> {
    const response = await apiClient.post<VerificationItem>(
      resolveEndpoint("/verification/verify"),
      { claim }
    );
    return response.data;
  }

  /**
   * Lister toutes les vérifications publiques (historique communautaire)
   * GET /api/v1/verification/all
   */
  static async listAll(
    page = 1,
    perPage = 20
  ): Promise<VerificationListResponse> {
    const response = await apiClient.get<VerificationListResponse>(
      resolveEndpoint("/verification/all"),
      {
        params: {
          page,
          per_page: perPage,
        },
      }
    );
    return response.data;
  }

  /**
   * Lister mes vérifications soumises par l'utilisateur connecté
   * GET /api/v1/verification/
   */
  static async listMine(
    page = 1,
    perPage = 20
  ): Promise<VerificationListResponse> {
    const response = await apiClient.get<VerificationListResponse>(
      resolveEndpoint("/verification/"),
      {
        params: {
          page,
          per_page: perPage,
        },
      }
    );
    return response.data;
  }

  /**
   * Détail d'une vérification avec ses sources
   * GET /api/v1/verification/{verification_id}
   */
  static async getById(verificationId: number | string): Promise<VerificationItem> {
    const response = await apiClient.get<VerificationItem>(
      resolveEndpoint(`/verification/${verificationId}`)
    );
    return response.data;
  }

  /**
   * Supprimer une vérification
   * DELETE /api/v1/verification/{verification_id}
   */
  static async delete(verificationId: number | string): Promise<void> {
    await apiClient.delete(
      resolveEndpoint(`/verification/${verificationId}`)
    );
  }
}

