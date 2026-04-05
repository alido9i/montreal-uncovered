"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RichEditor from "@/components/RichEditor";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCredit, setImageCredit] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/dashboard/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, excerpt, categoryId, imageUrl, imageCredit, published }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur lors de la création.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black">Nouvel article</h1>
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-black transition-colors"
        >
          ← Retour
        </Link>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 space-y-6">
        {/* Titre */}
        <div>
          <label htmlFor="title" className="block text-sm font-bold mb-1">
            Titre
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Le titre de votre article"
            className="w-full border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black"
          />
        </div>

        {/* Catégorie */}
        <div>
          <label htmlFor="category" className="block text-sm font-bold mb-1">
            Catégorie
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black bg-white"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Extrait */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-bold mb-1">
            Extrait <span className="text-gray-400 font-normal">(résumé affiché sur les cartes)</span>
          </label>
          <textarea
            id="excerpt"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Un bref résumé de l'article…"
            className="w-full border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
          />
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-bold mb-1">
            Image URL <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://exemple.com/image.jpg"
            className="w-full border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black"
          />
        </div>

        {/* Crédit photo */}
        <div>
          <label htmlFor="imageCredit" className="block text-sm font-bold mb-1">
            Crédit photo <span className="text-gray-400 font-normal">(optionnel, HTML autorisé)</span>
          </label>
          <textarea
            id="imageCredit"
            rows={2}
            value={imageCredit}
            onChange={(e) => setImageCredit(e.target.value)}
            placeholder='Par <a href="https://..." rel="nofollow">Photographe</a>, CC BY 2.0'
            className="w-full border-2 border-gray-200 px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-black resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Colle ici le HTML d&apos;attribution fourni par Wikimedia / Flickr / Unsplash.
          </p>
        </div>

        {/* Contenu */}
        <div>
          <label className="block text-sm font-bold mb-2">Contenu</label>
          <RichEditor
            value={content}
            onChange={setContent}
            placeholder="Écrivez votre article ici…"
          />
        </div>

        {/* Publier */}
        <div className="flex items-center gap-3">
          <input
            id="published"
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 accent-red-600"
          />
          <label htmlFor="published" className="text-sm font-bold">
            Publier immédiatement
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-white text-sm font-black uppercase tracking-widest disabled:opacity-60"
            style={{ backgroundColor: "#FF0033" }}
          >
            {loading ? "Création…" : "Créer l'article"}
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 text-sm font-bold text-gray-500 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </>
  );
}
