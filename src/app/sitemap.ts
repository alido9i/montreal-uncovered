import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://montrealuncovered.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques principales
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/culture",
    "/gastronomie",
    "/societe",
    "/montreal-local",
    "/style-de-vie",
    "/ailleurs",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  // Articles publiés — lastModified basé sur publishedAt / updatedAt
  const articles = await db.article.findMany({
    where: { published: true },
    select: { slug: true, publishedAt: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/article/${a.slug}`,
    lastModified: a.updatedAt ?? a.publishedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Pages de catégories dynamiques (si tu en as d'autres en DB)
  const categories = await db.category.findMany({
    select: { slug: true },
  });

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  // Dédupliquer les URLs (une catégorie DB peut déjà être dans staticRoutes)
  const seen = new Set<string>();
  return [...staticRoutes, ...categoryRoutes, ...articleRoutes].filter(
    (entry) => {
      if (seen.has(entry.url)) return false;
      seen.add(entry.url);
      return true;
    }
  );
}
