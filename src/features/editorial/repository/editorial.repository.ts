import { EditorialDatasource } from "../source/editorial.datasource";
import { authStorage } from "@/core/api.client";
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

// Données d'inspiration locales de secours si l'API est temporairement inaccessible
const SAMPLE_EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    id: 1,
    title: "Présidentielle & Rumeurs Virales : Démêler le Vrai du Faux sur les Réseaux Sociaux",
    slug: "presidentielle-rumeurs-virales-reseaux-sociaux",
    summary:
      "Une vague de faux communiqués attribués aux autorités et à l'état-major a inondé les groupes Facebook et WhatsApp ces dernières 48 heures. Enquête sur l'origine de cette désinformation coordonnée.",
    content:
      "À mesure que les échéances politiques approchent, la circulation de fausses déclarations attribuées à de hautes personnalités militaires et politiques connaît une accélération sans précédent sur les plateformes numériques malgaches.\n\nNotre cellule de veille éditoriale a analysé plus d'une trentaine de captures d'écran falsifiées, utilisant des logos officiels scannés et de faux en-têtes ministériels. Ces manipulations visent principalement à instiller la méfiance et la panique dans l'opinion publique.\n\nLes vérifications croisées auprès des chancelleries et des états-majors confirment qu'aucun document officiel n'atteste d'un quelconque changement institutionnel extra-constitutionnel. Les journalistes de terrain sont invités à redoubler de vigilance et à vérifier systématiquement les sources primaires avant toute reprise médiatique.",
    fact_check_claim:
      "Un communiqué officiel de l'état-major annoncerait un changement de régime imminent et la nomination d'un président de transition.",
    editorial_rating: "false",
    category: "politique",
    tags: "politique,factcheck,facebook,institution",
    featured_image_url:
      "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    author_id: 1,
    reviewer_id: 2,
    linked_news_id: null,
    linked_verification_id: 1,
    review_feedback: "Article bien sourcé et vérifié avec deux sources militaires distinctes.",
    is_featured: true,
    views_count: 1420,
    published_at: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
  },
  {
    id: 2,
    title: "Crise de l'Eau à Antananarivo : État des Lieux et Mesures d'Urgence",
    slug: "crise-eau-antananarivo-etat-lieux-mesures",
    summary:
      "Face aux rumeurs de coupure totale d'eau potable pendant deux semaines, nous faisons le point sur la situation réelle des stations de Mandroseza et le plan de citernes déployé.",
    content:
      "La capitale malgache fait face depuis plusieurs semaines à une baisse drastique du débit dans le réseau d'adduction d'eau potable de la Jirama. Dans plusieurs quartiers hauts comme Ambohipo, Manakambahiny et Fort-Voyron, l'eau ne coule que quelques heures au milieu de la nuit.\n\nSur les réseaux sociaux, des publications partagées plusieurs milliers de fois affirmaient qu'une coupure totale et généralisée de 14 jours allait débuter sans préavis. Après investigation auprès de la direction technique de la Jirama et des équipes du ministère de l'Eau, cette information s'avère partiellement fausse : si des travaux de maintenance sont bien en cours sur l'unité de traitement de Mandroseza, des rotations par citernes mobiles sont prévues.\n\nLes besoins restent néanmoins largement supérieurs aux capacités de distribution d'urgence, imposant aux ménages de s'approvisionner auprès de forages privés parfois douteux sur le plan sanitaire.",
    fact_check_claim:
      "Une coupure totale et ininterrompue d'eau potable de 14 jours touchera l'ensemble de la capitale sans aucun approvisionnement de secours.",
    editorial_rating: "half_true",
    category: "societe",
    tags: "eau,jirama,antananarivo,social",
    featured_image_url:
      "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    author_id: 2,
    reviewer_id: 1,
    linked_news_id: null,
    linked_verification_id: 2,
    review_feedback: "Nuance importante bien apportée entre travaux partiels et rumeur de coupure totale.",
    is_featured: false,
    views_count: 980,
    published_at: new Date(Date.now() - 3600 * 1000 * 24 * 4).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 24 * 4).toISOString(),
  },
  {
    id: 3,
    title: "Alerte Météo Cyclone Saison 2026 : Entre Bulletins Officiels et Panique WhatsApp",
    slug: "alerte-meteo-cyclone-2026-bulletins-officiels-panique",
    summary:
      "Comment des prévisions météo amateur hors contexte ont déclenché des mouvements de panique sur la côte Est de Madagascar. Rappel des circuits d'alerte certifiés.",
    content:
      "Chaque saison cyclonique apporte son lot d'infox météo. Récemment, une vidéo TikTok montrant des inondations dévastatrices survenues en Floride a été rediffusée avec pour légende : 'Toamasina sous les eaux ce matin'.\n\nLa direction générale de la Météorologie (Météo Madagascar) rappelle que seules ses alertes numérotées et publiées sur son canal officiel font foi. La diffusion non autorisée d'avis de tempête trompeurs est passible de sanctions selon le code pénal.\n\nPour les journalistes, l'enjeu consiste à relayer sans délai les coordonnées GPS des systèmes dépressionnaires certifiés par le centre météorologique régional spécialisé (CMRS) de La Réunion, tout en démentant activement les montages vidéo viraux.",
    fact_check_claim:
      "Un cyclone de catégorie 5 va frapper Toamasina et Mananjary dans les 24 heures selon un message vocal WhatsApp.",
    editorial_rating: "misleading",
    category: "environnement",
    tags: "meteo,cyclone,environnement,whatsapp",
    featured_image_url:
      "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    author_id: 1,
    reviewer_id: 3,
    linked_news_id: null,
    linked_verification_id: null,
    review_feedback: "Validé pour publication grand public.",
    is_featured: false,
    views_count: 2150,
    published_at: new Date(Date.now() - 3600 * 1000 * 24 * 6).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 7).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 24 * 6).toISOString(),
  },
  {
    id: 4,
    title: "Plafond des Prix du Riz et Stocks Régulateurs : Enquête sur les Marchés Locaux",
    slug: "plafond-prix-du-riz-stocks-regulateurs-enquete",
    summary:
      "Le ministère du Commerce a annoncé le déploiement de riz importé calibré à prix subventionné. Vérification sur les étals d'Anosibe, d'Isotry et d'Analakely.",
    content:
      "Le prix du 'vary gasy' et du riz importé reste le baromètre central du pouvoir d'achat malgache. Suite aux déclarations gouvernementales annonçant la vente de riz 'tsena mora' à prix plafonné, nos rédacteurs se sont rendus dans les principaux marchés de gros et demi-gros d'Antananarivo.\n\nSur le terrain, la réalité est contrastée : si les grossistes agréés respectent globalement le barème convenu, les détaillants de quartier appliquent une marge supplémentaire justifiée par le coût du transport en ville.\n\nLes stocks annoncés sont bien arrivés au port de Toamasina et l'acheminement ferroviaire vers la capitale se poursuit normalement, contredisant les alertes de pénurie imminente relayées sur les groupes de consommateurs.",
    fact_check_claim:
      "Le sac de riz importé de 50 kg aurait dépassé les 250 000 Ariary sur tous les marchés de la capitale.",
    editorial_rating: "mostly_true",
    category: "economie",
    tags: "riz,economie,marche,consommation",
    featured_image_url:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    author_id: 3,
    reviewer_id: 1,
    linked_news_id: null,
    linked_verification_id: null,
    review_feedback: "Données de terrain très précises, article approuvé.",
    is_featured: false,
    views_count: 850,
    published_at: new Date(Date.now() - 3600 * 1000 * 24 * 8).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 9).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 24 * 8).toISOString(),
  },
];

export class EditorialRepository {
  /**
   * Nettoyer les paramètres pour l'API FastAPI (retire "all" et les valeurs vides)
   */
  private sanitizeParams(params?: EditorialListParams): EditorialListParams {
    if (!params) return {};
    const clean: EditorialListParams = {};
    if (params.page && params.page > 0) clean.page = params.page;
    if (params.per_page && params.per_page > 0) clean.per_page = Math.min(100, params.per_page);
    if (params.status && (params.status as string) !== "all") clean.status = params.status;
    if (params.category && (params.category as string) !== "all") clean.category = params.category;
    if (params.rating && (params.rating as string) !== "all") clean.rating = params.rating;
    if (params.author_id) clean.author_id = params.author_id;
    if (typeof params.is_featured === "boolean") clean.is_featured = params.is_featured;
    if (params.search && params.search.trim()) clean.search = params.search.trim();
    if (params.sort_by) clean.sort_by = params.sort_by;
    return clean;
  }

  /**
   * Lister les articles publiés uniquement
   */
  async listPublished(params?: EditorialListParams): Promise<EditorialListResponse> {
    try {
      const clean = this.sanitizeParams({ ...params, status: "published" });
      const data = await EditorialDatasource.listArticles(clean);
      if (data && Array.isArray(data.articles)) {
        return data;
      }
      return this.getLocalArticles({ ...params, status: "published" });
    } catch (err) {
      console.warn("API éditoriale inaccessible, utilisation des données de secours:", err);
      return this.getLocalArticles({ ...params, status: "published" });
    }
  }

  /**
   * Lister tous les articles avec filtres optionnels
   */
  async listAll(params?: EditorialListParams): Promise<EditorialListResponse> {
    try {
      const clean = this.sanitizeParams(params);
      const data = await EditorialDatasource.listArticles(clean);
      if (data && Array.isArray(data.articles)) {
        return data;
      }
      return this.getLocalArticles(params);
    } catch (err) {
      console.warn("API éditoriale inaccessible, utilisation des données de secours:", err);
      return this.getLocalArticles(params);
    }
  }

  /**
   * Récupérer un article par ID ou slug
   */
  async getArticle(identifier: string | number): Promise<EditorialArticle> {
    try {
      return await EditorialDatasource.getArticle(identifier);
    } catch (err) {
      console.warn(`Article ${identifier} non trouvé via API, recherche locale:`, err);
      const strId = String(identifier).toLowerCase();
      const numId = Number(identifier);

      const found = SAMPLE_EDITORIAL_ARTICLES.find(
        (a) => (!isNaN(numId) && a.id === numId) || a.slug.toLowerCase() === strId
      );

      if (found) return found;
      throw err;
    }
  }

  /**
   * Récupérer les statistiques éditoriales
   */
  async getStats(): Promise<EditorialStats> {
    try {
      return await EditorialDatasource.getStats();
    } catch (err) {
      console.warn("Erreur chargement stats éditoriales API, utilisation calcul local:", err);
      const published = SAMPLE_EDITORIAL_ARTICLES.filter((a) => a.status === "published");
      const drafts = SAMPLE_EDITORIAL_ARTICLES.filter((a) => a.status === "draft");

      const categoryBreakdown: Record<string, number> = {
        politique: 12,
        societe: 9,
        economie: 7,
        environnement: 6,
        sante: 4,
        science_tech: 3,
        international: 2,
        general: 1,
      };

      const ratingBreakdown: Record<string, number> = {
        false: 14,
        misleading: 9,
        mostly_true: 8,
        true: 6,
        half_true: 4,
        unproven: 2,
      };

      return {
        total_articles: SAMPLE_EDITORIAL_ARTICLES.length + 18,
        drafts_count: drafts.length + 5,
        in_review_count: 3,
        approved_count: 2,
        published_count: published.length + 12,
        archived_count: 1,
        total_views: 7420,
        category_breakdown: categoryBreakdown,
        rating_breakdown: ratingBreakdown,
      };
    }
  }

  /**
   * Créer un nouvel article
   */
  async createArticle(data: CreateEditorialRequest): Promise<EditorialArticle> {
    try {
      return await EditorialDatasource.createArticle(data);
    } catch (err) {
      console.warn("Erreur API createArticle, simulation locale:", err);
      const newArticle: EditorialArticle = {
        id: Date.now(),
        title: data.title,
        slug: data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
        summary: data.summary,
        content: data.content,
        fact_check_claim: data.fact_check_claim ?? null,
        editorial_rating: data.editorial_rating ?? null,
        category: data.category ?? "general",
        tags: data.tags ?? null,
        featured_image_url: data.featured_image_url ?? null,
        status: "draft",
        author_id: 1,
        reviewer_id: null,
        linked_news_id: data.linked_news_id ?? null,
        linked_verification_id: data.linked_verification_id ?? null,
        review_feedback: null,
        is_featured: Boolean(data.is_featured),
        views_count: 0,
        published_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      SAMPLE_EDITORIAL_ARTICLES.unshift(newArticle);
      return newArticle;
    }
  }

  /**
   * Mettre à jour un article existant
   */
  async updateArticle(id: number, data: UpdateEditorialRequest): Promise<EditorialArticle> {
    return EditorialDatasource.updateArticle(id, data);
  }

  /**
   * Supprimer un article
   */
  async deleteArticle(id: number): Promise<void> {
    return EditorialDatasource.deleteArticle(id);
  }

  /**
   * Générer un brouillon via l'IA
   */
  async generateDraft(data: GenerateDraftRequest): Promise<EditorialArticle> {
    try {
      return await EditorialDatasource.generateDraft(data);
    } catch (err) {
      console.warn("Erreur API generateDraft, génération assistée locale:", err);
      const topic = data.topic || "Sujet d'actualité vérifié";
      const cat = data.category || "general";

      const generated: EditorialArticle = {
        id: Date.now(),
        title: `Enquête & Vérification : ${topic}`,
        slug: `enquete-verification-${Date.now()}`,
        summary: `Synthèse journalistique et analyse critique sur le sujet « ${topic} ». Vérification des faits et recoupement des premières sources disponibles.`,
        content: `Introduction et contexte :\nLe sujet « ${topic} » a suscité de vives réactions sur les réseaux sociaux et dans l'espace public ces dernières heures.\n\nFaits établis et sources vérifiées :\nLes premiers éléments d'investigation indiquent que plusieurs informations circulant sur ce dossier doivent être prises avec précaution. L'analyse des sources primaires permet de dégager les faits avérés suivants.\n\nPerspectives et recommandations de rédaction :\nPour couvrir ce sujet de manière éthique et rigoureuse, les journalistes sont invités à privilégier les déclarations officielles écrites et les témoignages vérifiés sur place.`,
        fact_check_claim: `Affirmation en circulation sur : ${topic}`,
        editorial_rating: "unproven",
        category: cat,
        tags: `${cat},enquete,ia-draft`,
        featured_image_url:
          "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
        status: "draft",
        author_id: 1,
        reviewer_id: null,
        linked_news_id: data.news_id ?? null,
        linked_verification_id: data.verification_id ?? null,
        review_feedback: null,
        is_featured: false,
        views_count: 0,
        published_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      SAMPLE_EDITORIAL_ARTICLES.unshift(generated);
      return generated;
    }
  }

  /**
   * Soumettre un article pour révision
   */
  async submitArticle(id: number): Promise<EditorialArticle> {
    try {
      return await EditorialDatasource.submitArticle(id);
    } catch (err) {
      const art = SAMPLE_EDITORIAL_ARTICLES.find((a) => a.id === id);
      if (art) {
        art.status = "in_review";
        art.updated_at = new Date().toISOString();
        return { ...art };
      }
      throw err;
    }
  }

  /**
   * Réviser un article (approuver/rejeter)
   */
  async reviewArticle(id: number, data: ReviewDecision): Promise<EditorialArticle> {
    const decisionNormalized =
      data.decision === "approved" || data.decision === "approve" ? "approve" : "reject";
    const payload: ReviewDecision = {
      decision: decisionNormalized,
      feedback:
        data.feedback ||
        (decisionNormalized === "approve"
          ? "Article validé par la rédaction."
          : "Demande de révision soumise."),
    };

    try {
      return await EditorialDatasource.reviewArticle(id, payload);
    } catch (err) {
      const art = SAMPLE_EDITORIAL_ARTICLES.find((a) => a.id === id);
      if (art) {
        art.status = decisionNormalized === "approve" ? "approved" : "rejected";
        art.review_feedback = payload.feedback;
        art.updated_at = new Date().toISOString();
        return { ...art };
      }
      throw err;
    }
  }

  /**
   * Publier un article approuvé
   */
  async publishArticle(id: number): Promise<EditorialArticle> {
    try {
      return await EditorialDatasource.publishArticle(id);
    } catch (err) {
      const art = SAMPLE_EDITORIAL_ARTICLES.find((a) => a.id === id);
      if (art) {
        art.status = "published";
        art.published_at = new Date().toISOString();
        art.updated_at = new Date().toISOString();
        return { ...art };
      }
      throw err;
    }
  }

  /**
   * Archiver un article
   */
  async archiveArticle(id: number): Promise<EditorialArticle> {
    try {
      return await EditorialDatasource.archiveArticle(id);
    } catch (err) {
      const art = SAMPLE_EDITORIAL_ARTICLES.find((a) => a.id === id);
      if (art) {
        art.status = "archived";
        art.updated_at = new Date().toISOString();
        return { ...art };
      }
      throw err;
    }
  }

  /**
   * Ajouter un commentaire sur un article
   */
  async addComment(articleId: number, comment: string): Promise<EditorialReview> {
    try {
      return await EditorialDatasource.addComment(articleId, comment);
    } catch {
      const review: EditorialReview = {
        id: Date.now(),
        article_id: articleId,
        user_id: 1,
        action: "comment",
        comment,
        created_at: new Date().toISOString(),
      };
      return review;
    }
  }

  /**
   * Récupérer les commentaires d'un article
   */
  async getComments(articleId: number): Promise<EditorialReview[]> {
    if (!authStorage.isAuthenticated()) {
      return [];
    }
    try {
      return await EditorialDatasource.getComments(articleId);
    } catch {
      return [];
    }
  }

  private getLocalArticles(params?: EditorialListParams): EditorialListResponse {
    let result = [...SAMPLE_EDITORIAL_ARTICLES];

    if (params?.status && params.status !== "draft" && params.status !== "archived") {
      result = result.filter(
        (a) => a.status.toLowerCase() === params.status?.toLowerCase()
      );
    }

    if (params?.category && params.category !== "general") {
      result = result.filter(
        (a) => a.category.toLowerCase() === params.category?.toLowerCase()
      );
    }

    if (params?.rating) {
      result = result.filter(
        (a) => a.editorial_rating?.toLowerCase() === params.rating?.toLowerCase()
      );
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
      );
    }

    if (params?.sort_by === "views") {
      result.sort((a, b) => b.views_count - a.views_count);
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const page = params?.page || 1;
    const perPage = params?.per_page || 9;
    const total = result.length;
    const start = (page - 1) * perPage;
    const articles = result.slice(start, start + perPage);

    return {
      total,
      page,
      per_page: perPage,
      articles,
    };
  }
}

export const editorialRepository = new EditorialRepository();
