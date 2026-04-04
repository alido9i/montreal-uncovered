"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  article: { id: string; title: string; slug: string };
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/comments")
      .then((r) => r.json())
      .then((data) => { setComments(data); setLoading(false); });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce commentaire ?")) return;
    await fetch(`/api/dashboard/comments/${id}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  const filtered = comments.filter(
    (c) =>
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      (c.user.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      c.article.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Commentaires</h1>
          <p className="text-sm text-gray-500 mt-0.5">{comments.length} commentaire(s)</p>
        </div>
      </div>

      <div className="bg-white rounded border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Rechercher dans les commentaires…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded border border-gray-200 text-center py-16 text-gray-400">
          <p className="font-bold">Aucun commentaire</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded border border-gray-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                      style={{ backgroundColor: "#6366f1" }}
                    >
                      {(comment.user.name?.[0] ?? comment.user.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-semibold">
                        {comment.user.name ?? comment.user.email}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(comment.createdAt).toLocaleDateString("fr-CA", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    {comment.content}
                  </p>

                  {/* Article link */}
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>sur</span>
                    <Link
                      href={`/dashboard/articles/${comment.article.id}/edit`}
                      className="font-semibold text-gray-600 hover:text-red-600 transition-colors"
                    >
                      {comment.article.title}
                    </Link>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                  title="Supprimer"
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
