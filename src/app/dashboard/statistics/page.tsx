"use client";

import { useEffect, useState } from "react";

interface Stats {
  counts: {
    articles: number;
    published: number;
    drafts: number;
    users: number;
    comments: number;
    views: number;
    likes: number;
  };
  topArticles: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    publishedAt: string | null;
    category: { name: string };
    _count: { comments: number; likes: number };
  }>;
  articlesByCategory: Array<{
    name: string;
    slug: string;
    _count: { articles: number };
  }>;
}

function BarChart({
  data,
  maxValue,
}: {
  data: Array<{ label: string; value: number; color?: string }>;
  maxValue: number;
}) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold truncate">{item.label}</span>
            <span className="text-gray-500 shrink-0 ml-2">{item.value.toLocaleString("fr-CA")}</span>
          </div>
          <div className="w-full h-6 bg-gray-100 rounded overflow-hidden">
            <div
              className="h-full rounded transition-all duration-500"
              style={{
                width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                backgroundColor: item.color ?? "#FF0033",
                minWidth: item.value > 0 ? "4px" : "0",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const maxViews = Math.max(...stats.topArticles.map((a) => a.views), 1);
  const maxCatArticles = Math.max(...stats.articlesByCategory.map((c) => c._count.articles), 1);

  const engagementRate = stats.counts.views > 0
    ? ((stats.counts.comments + stats.counts.likes) / stats.counts.views * 100).toFixed(2)
    : "0";

  const avgViewsPerArticle = stats.counts.published > 0
    ? Math.round(stats.counts.views / stats.counts.published)
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Statistiques</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Vues totales", value: stats.counts.views.toLocaleString("fr-CA"), color: "#10b981" },
          { label: "Articles publiés", value: stats.counts.published.toString(), color: "#FF0033" },
          { label: "Moy. vues/article", value: avgViewsPerArticle.toLocaleString("fr-CA"), color: "#6366f1" },
          { label: "Taux engagement", value: `${engagementRate}%`, color: "#f59e0b" },
          { label: "Utilisateurs", value: stats.counts.users.toString(), color: "#8b5cf6" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded border border-gray-200 p-5">
            <p className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top articles by views */}
        <div className="bg-white rounded border border-gray-200 p-5">
          <h2 className="font-black text-sm uppercase tracking-wide mb-4">Articles par nombre de vues</h2>
          <BarChart
            data={stats.topArticles.map((a) => ({
              label: a.title,
              value: a.views,
            }))}
            maxValue={maxViews}
          />
        </div>

        {/* Articles by category */}
        <div className="bg-white rounded border border-gray-200 p-5">
          <h2 className="font-black text-sm uppercase tracking-wide mb-4">Articles par catégorie</h2>
          <BarChart
            data={stats.articlesByCategory.map((c, i) => ({
              label: c.name,
              value: c._count.articles,
              color: ["#FF0033", "#6366f1", "#10b981", "#f59e0b", "#8b5cf6"][i % 5],
            }))}
            maxValue={maxCatArticles}
          />

          {/* Pie-like summary */}
          <div className="mt-6 flex items-center gap-4 flex-wrap">
            {stats.articlesByCategory.map((c, i) => {
              const pct = stats.counts.articles > 0
                ? Math.round((c._count.articles / stats.counts.articles) * 100)
                : 0;
              return (
                <div key={c.slug} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ["#FF0033", "#6366f1", "#10b981", "#f59e0b", "#8b5cf6"][i % 5] }}
                  />
                  <span className="text-xs text-gray-600">{c.name} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed table */}
      <div className="bg-white rounded border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-black text-sm uppercase tracking-wide">Détail par article</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wide text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Article</th>
                <th className="px-5 py-3">Catégorie</th>
                <th className="px-5 py-3 text-right">Vues</th>
                <th className="px-5 py-3 text-right">Likes</th>
                <th className="px-5 py-3 text-right">Commentaires</th>
                <th className="px-5 py-3 text-right">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.topArticles.map((article, i) => {
                const engagement = article.views > 0
                  ? ((article._count.comments + article._count.likes) / article.views * 100).toFixed(1)
                  : "0";
                return (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-black text-gray-300">{i + 1}</td>
                    <td className="px-5 py-3 text-sm font-semibold max-w-xs truncate">{article.title}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold uppercase" style={{ color: "#FF0033" }}>
                        {article.category.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-right font-semibold">{article.views.toLocaleString("fr-CA")}</td>
                    <td className="px-5 py-3 text-sm text-right">{article._count.likes}</td>
                    <td className="px-5 py-3 text-sm text-right">{article._count.comments}</td>
                    <td className="px-5 py-3 text-sm text-right">
                      <span className={`font-semibold ${parseFloat(engagement) > 1 ? "text-green-600" : "text-gray-400"}`}>
                        {engagement}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
