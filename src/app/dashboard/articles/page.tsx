"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  publishedAt: string | null;
  views: number;
  category: { name: string };
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/dashboard/articles")
      .then((r) => r.json())
      .then((data) => { setArticles(data); setLoading(false); });
  }, []);

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" || (filter === "published" ? a.published : !a.published);
    return matchSearch && matchFilter;
  });

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((a) => a.id)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet article ?")) return;
    await fetch(`/api/dashboard/articles/${id}`, { method: "DELETE" });
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  async function handleBulkDelete() {
    if (!confirm(`Supprimer ${selected.size} article(s) ?`)) return;
    await Promise.all(
      Array.from(selected).map((id) =>
        fetch(`/api/dashboard/articles/${id}`, { method: "DELETE" })
      )
    );
    setArticles((prev) => prev.filter((a) => !selected.has(a.id)));
    setSelected(new Set());
  }

  async function handleTogglePublish(id: string, published: boolean) {
    await fetch(`/api/dashboard/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, published: !published } : a))
    );
  }

  const publishedCount = articles.filter((a) => a.published).length;
  const draftCount = articles.filter((a) => !a.published).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Articles</h1>
        <Link
          href="/dashboard/articles/new"
          className="px-4 py-2 text-white text-xs font-bold uppercase tracking-widest rounded"
          style={{ backgroundColor: "#FF0033" }}
        >
          + Nouvel article
        </Link>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded border border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Tab filters */}
        <div className="flex items-center gap-1 text-sm">
          {([
            ["all", `Tout (${articles.length})`],
            ["published", `Publiés (${publishedCount})`],
            ["draft", `Brouillons (${draftCount})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                filter === key
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Rechercher un article…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 text-xs font-bold border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
          >
            Supprimer ({selected.size})
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded border border-gray-200 text-center py-16 text-gray-400">
          <p className="font-bold mb-1">Aucun article trouvé</p>
          <p className="text-sm">
            {search ? "Essayez un autre terme de recherche." : "Créez votre premier article."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wide text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="accent-red-600"
                  />
                </th>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Vues</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(article.id)}
                      onChange={() => toggleSelect(article.id)}
                      className="accent-red-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/articles/${article.id}/edit`}
                      className="text-sm font-semibold hover:text-red-600 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold uppercase" style={{ color: "#FF0033" }}>
                      {article.category.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        article.published
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${article.published ? "bg-green-500" : "bg-amber-400"}`} />
                      {article.published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {article.views.toLocaleString("fr-CA")}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("fr-CA")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleTogglePublish(article.id, article.published)}
                        className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                        title={article.published ? "Dépublier" : "Publier"}
                      >
                        {article.published ? (
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                      <Link
                        href={`/dashboard/articles/${article.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Modifier"
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                      <Link
                        href={`/article/${article.slug}`}
                        target="_blank"
                        className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
                        title="Voir"
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
