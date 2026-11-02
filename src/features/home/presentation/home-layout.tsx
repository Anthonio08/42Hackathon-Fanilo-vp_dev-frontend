"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Incendie } from "@/features/home/presentation/Incident";
import { Section } from "@/features/home/presentation/Section";
import { Filter } from "./filter";
import { LastIncident } from "./last-incident";
import { Article } from "./article";
import { ArticleModal } from "./article-modal";
import { articleRepository } from "@/features/article/repository/article.repository";
import type { ArticleItem } from "@/features/article/domain/article.entity";

export default function HomeLayout() {
  const router = useRouter();
  const [active, setActive] = useState("Tous");
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await articleRepository.getAll();
      setArticles(data);
    } catch (err) {
      console.warn("Erreur chargement articles accueil :", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    articleRepository
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setArticles(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("Erreur chargement articles accueil :", err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Calcul des compteurs par catégorie
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Tous: articles.length,
      Sécurité: 0,
      Transport: 0,
      Météo: 0,
      Événement: 0,
      Santé: 0,
      Autres: 0,
    };
    articles.forEach((a) => {
      const cat = a.category || "Autres";
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
      } else {
        counts["Autres"] += 1;
      }
    });
    return counts;
  }, [articles]);

  // Article dynamique mis à la une
  const featured = articles.length > 0 ? articles[0] : null;
  // Les articles suivants alimentent le flux paginé
  const feedArticles = articles.length > 1 ? articles.slice(1) : articles;

  const handleOpenFeatured = () => {
    if (featured) setSelectedArticle(featured);
  };

  const handleVerifyFeatured = () => {
    if (featured) {
      router.push(`/verify?claim=${encodeURIComponent(featured.title)}`);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      {/* Section "À la une" + Widget Incendie */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          {featured ? (
            <Section
              id={featured.id}
              title={featured.title}
              date={
                featured.published_at
                  ? new Date(featured.published_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : featured.date || "Récemment"
              }
              description={featured.content || featured.description || ""}
              nb_coms={String(featured.nbComs ?? 15)}
              image={featured.image || featured.image_url || "/login-hero.jpg"}
              category={featured.category}
              status={featured.status}
              source={featured.source}
              onRead={handleOpenFeatured}
              onVerify={handleVerifyFeatured}
            />
          ) : (
            <Section
              title="Incendie à Behoririka : intervention des secours"
              date="30 octobre 2026 - 10h26"
              description="Un violent incendie a éclaté dans le quartier Behoririka dans la nuit. Les services de secours ont évacué une vingtaine de personnes."
              nb_coms="24"
              image="/login-hero.jpg"
              category="Sécurité"
              status="verified"
              onRead={() =>
                setSelectedArticle({
                  id: 1,
                  title: "Incendie à Behoririka : intervention des secours",
                  content:
                    "Un violent incendie a éclaté dans le quartier Behoririka dans la nuit. Les services de secours ont évacué une vingtaine de personnes. Aucun blessé grave n'est à déplorer selon les autorités locales.",
                  source: "Protection Civile",
                  source_url: "",
                  author: "Rédaction",
                  image_url: "/login-hero.jpg",
                  status: "verified",
                  collected_by_id: 1,
                  published_at: new Date().toISOString(),
                  collected_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  category: "Sécurité",
                  color: "red",
                  date: "30 oct. 2026",
                  nbComs: 24,
                })
              }
            />
          )}
        </div>
        <aside className="w-full lg:col-span-1">
          <Incendie />
        </aside>
      </div>

      {/* Filtres par Catégorie, Flux d'actualités et Alertes latérales */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Filter
            active={active}
            setActive={setActive}
            counts={categoryCounts}
          />
          <div className="mt-8">
            <Article
              active={active}
              articles={feedArticles}
              loading={loading}
              onRefresh={loadArticles}
              onSelectArticle={(art) => setSelectedArticle(art)}
            />
          </div>
        </div>
        <aside className="w-full lg:col-span-1">
          <LastIncident
            articles={articles}
            onSelectIncident={(art) => setSelectedArticle(art)}
            onSelectCategory={(cat) => setActive(cat)}
          />
        </aside>
      </div>

      {/* Lecteur d'article dynamique (Modal) */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </main>
  );
}
