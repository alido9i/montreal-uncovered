"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import RichEditor from "@/components/RichEditor";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [slug, setSlug] = useState("");
  const [views, setViews] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/categories").then((r) => r.json()),
      fetch(`/api/dashboard/articles/${articleId}`).then((r) => r.json()),
    ]).then(([cats, article]) => {
      setCategories(cats);
      if (article && !article.error) {
        setTitle(article.title);
        setContent(article.content ?? "");
        setExcerpt(article.excerpt ?? "");
        setCategoryId(article.categoryId);
        setImageUrl(article.imageUrl ?? "");
        setPublished(article.published);
        setSlug(article.slug);
        setViews(article.views ?? 0);
      }
      setFetching(false);
    });
  }, [articleId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/dashboard/articles/${articleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, excerpt, categoryId, imageUrl, published }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur lors de la mise à jour.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/articles");
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Modifier l'article</h1>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
            <span className="font-mono">/{slug}</span>
            <span>·</span>
            <span>{views} vues</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/article/${slug}`}
            target="_blank"
            className="px-3 py-2 text-xs font-bold border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            Voir
          </Link>
          <Link
            href="/dashboard/articles"
            className="px-3 py-2 text-xs text-gray-500 hover:text-black transition-colors"
          >
            ← Retour
          </Link>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded border border-gray-200 p-5 space-y-5">
            <div>
              <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                Titre
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                Extrait
              </label>
              <textarea
                id="excerpt"
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Résumé affiché sur les cartes…"
                className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                Contenu
              </label>
              <RichEditor value={content} onChange={setContent} />
            </div>
          </div>
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-5">
          {/* Publish box */}
          <div className="bg-white rounded border border-gray-200 p-5 space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wide">Publication</h3>
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${published ? "bg-green-500" : "bg-amber-400"}`} />
              <span className="text-sm font-semibold">
                {published ? "Publié" : "Brouillon"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 accent-red-600"
              />
              <label htmlFor="published" className="text-sm">
                Publier
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-white text-xs font-bold uppercase tracking-widest rounded disabled:opacity-60"
              style={{ backgroundColor: "#FF0033" }}
            >
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>

          {/* Category */}
          <div className="bg-white rounded border border-gray-200 p-5 space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wide">Catégorie</h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-black bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Image */}
          <div className="bg-white rounded border border-gray-200 p-5 space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wide">Image de couverture</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
            {imageUrl && (
              <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
