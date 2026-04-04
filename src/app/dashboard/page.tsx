"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  recentArticles: Array<{
    id: string;
    title: string;
    slug: string;
    published: boolean;
    publishedAt: string | null;
    createdAt: string;
    views: number;
    category: { name: string };
    author: { name: string | null };
    _count: { comments: number; likes: number };
  }>;
  topArticles: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    category: { name: string };
    _count: { comments: number; likes: number };
  }>;
  recentComments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { name: string | null; email: string };
    article: { title: string; slug: string };
  }>;
  articlesByCategory: Array<{
    name: string;
    slug: string;
    _count: { articles: number };
  }>;
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
  }>;
}

function StatCard({
  label,
  value,
  icon,
  color,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded border border-gray-200 p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div
        className="w-12 h-12 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + "15", color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black">{value.toLocaleString("fr-CA")}</p>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days}j`;
  return new Date(date).toLocaleDateString("fr-CA");
}

export default function DashboardOverview() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Tableau de bord</h1>
        <Link
          href="/dashboard/articles/new"
          className="px-4 py-2 text-white text-xs font-bold uppercase tracking-widest rounded"
          style={{ backgroundColor: "#FF0033" }}
        >
          + Nouvel article
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Articles"
          value={stats.counts.articles}
          href="/dashboard/articles"
          color="#FF0033"
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
        />
        <StatCard
          label="Vues totales"
          value={stats.counts.views}
          color="#10b981"
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
        />
        <StatCard
          label="Utilisateurs"
          value={stats.counts.users}
          href="/dashboard/users"
          color="#6366f1"
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>}
        />
        <StatCard
          label="Commentaires"
          value={stats.counts.comments}
          href="/dashboard/comments"
          color="#f59e0b"
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
        />
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4 text-center">
          <p className="text-xl font-black text-green-600">{stats.counts.published}</p>
          <p className="text-xs text-gray-500 font-semibold">Publiés</p>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4 text-center">
          <p className="text-xl font-black text-amber-500">{stats.counts.drafts}</p>
          <p className="text-xs text-gray-500 font-semibold">Brouillons</p>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4 text-center">
          <p className="text-xl font-black text-pink-500">{stats.counts.likes}</p>
          <p className="text-xs text-gray-500 font-semibold">Likes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent articles — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-black text-sm uppercase tracking-wide">Articles récents</h2>
            <Link href="/dashboard/articles" className="text-xs text-red-600 font-bold hover:underline">
              Voir tout →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentArticles.map((article) => (
              <div key={article.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${article.published ? "bg-green-500" : "bg-amber-400"}`} />
                    <Link
                      href={`/dashboard/articles/${article.id}/edit`}
                      className="text-sm font-semibold truncate hover:text-red-600 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                    <span style={{ color: "#FF0033" }} className="font-bold">{article.category.name}</span>
                    <span>·</span>
                    <span>{timeAgo(article.createdAt)}</span>
                    <span>·</span>
                    <span>{article.views} vues</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                  <span title="Commentaires">{article._count.comments} 💬</span>
                  <span title="Likes">{article._count.likes} ❤️</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Categories breakdown */}
          <div className="bg-white rounded border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-black text-sm uppercase tracking-wide">Par catégorie</h2>
            </div>
            <div className="p-5 space-y-3">
              {stats.articlesByCategory.map((cat) => {
                const total = stats.counts.articles || 1;
                const pct = Math.round((cat._count.articles / total) * 100);
                return (
                  <div key={cat.slug}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">{cat.name}</span>
                      <span className="text-gray-400">{cat._count.articles}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: "#FF0033" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent comments */}
          <div className="bg-white rounded border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-black text-sm uppercase tracking-wide">Derniers commentaires</h2>
              <Link href="/dashboard/comments" className="text-xs text-red-600 font-bold hover:underline">
                Tout →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stats.recentComments.length === 0 ? (
                <p className="p-5 text-xs text-gray-400">Aucun commentaire</p>
              ) : (
                stats.recentComments.map((comment) => (
                  <div key={comment.id} className="px-5 py-3">
                    <p className="text-sm line-clamp-2">{comment.content}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span className="font-semibold text-gray-600">{comment.user.name ?? comment.user.email}</span>
                      <span>·</span>
                      <span>{timeAgo(comment.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top articles table */}
      <div className="bg-white rounded border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-black text-sm uppercase tracking-wide">Articles les plus populaires</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-bold uppercase tracking-wide text-gray-500 border-b border-gray-100">
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Article</th>
              <th className="px-5 py-3">Catégorie</th>
              <th className="px-5 py-3 text-right">Vues</th>
              <th className="px-5 py-3 text-right">Likes</th>
              <th className="px-5 py-3 text-right">Commentaires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {stats.topArticles.map((article, i) => (
              <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-sm font-black text-gray-300">{i + 1}</td>
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/articles/${article.id}/edit`}
                    className="text-sm font-semibold hover:text-red-600 transition-colors"
                  >
                    {article.title}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs font-bold uppercase" style={{ color: "#FF0033" }}>
                    {article.category.name}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-right font-semibold">
                  {article.views.toLocaleString("fr-CA")}
                </td>
                <td className="px-5 py-3 text-sm text-right">{article._count.likes}</td>
                <td className="px-5 py-3 text-sm text-right">{article._count.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
