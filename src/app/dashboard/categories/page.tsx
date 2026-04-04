"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { articles: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/categories")
      .then((r) => r.json())
      .then((data) => { setCategories(data); setLoading(false); });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError("");
    setCreating(true);

    const res = await fetch("/api/dashboard/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      setCreating(false);
      return;
    }

    const cat = await res.json();
    setCategories((prev) => [...prev, { ...cat, _count: { articles: 0 } }]);
    setNewName("");
    setCreating(false);
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    await fetch(`/api/dashboard/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: editName.trim() } : c))
    );
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    const cat = categories.find((c) => c.id === id);
    if (cat && cat._count.articles > 0) {
      alert(`Impossible : ${cat._count.articles} article(s) dans cette catégorie.`);
      return;
    }
    if (!confirm("Supprimer cette catégorie ?")) return;

    const res = await fetch(`/api/dashboard/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      const data = await res.json();
      alert(data.error);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black">Catégories</h1>

      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white rounded border border-gray-200 p-5 flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
            Nouvelle catégorie
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom de la catégorie"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="px-4 py-2 text-white text-xs font-bold uppercase tracking-widest rounded disabled:opacity-50"
          style={{ backgroundColor: "#FF0033" }}
        >
          {creating ? "Ajout…" : "Ajouter"}
        </button>
      </form>

      {error && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wide text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3">Nom</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3 text-center">Articles</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    {editingId === cat.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(cat.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-48 focus:outline-none focus:border-black"
                      />
                    ) : (
                      <span className="text-sm font-semibold">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400 font-mono">{cat.slug}</td>
                  <td className="px-5 py-3 text-center text-sm">{cat._count.articles}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === cat.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(cat.id)}
                            className="px-2 py-1 text-xs font-bold text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            Enregistrer
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-xs text-gray-400 hover:bg-gray-100 rounded transition-colors"
                          >
                            Annuler
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Modifier"
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          </button>
                        </>
                      )}
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
