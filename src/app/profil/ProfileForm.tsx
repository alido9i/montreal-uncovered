"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  initialName: string;
  email: string;
}

export default function ProfileForm({ initialName, email }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        ...(newPassword && { currentPassword, newPassword }),
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    setSuccess("Profil mis à jour avec succès.");
    setCurrentPassword("");
    setNewPassword("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
          {success}
        </div>
      )}

      {/* Informations */}
      <section className="border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-black uppercase tracking-wide mb-6">
          Informations
        </h2>

        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="w-full border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">
              L&apos;email ne peut pas être modifié.
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              className="w-full border-2 border-gray-200 dark:border-gray-800 bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>
        </div>
      </section>

      {/* Mot de passe */}
      <section className="border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-black uppercase tracking-wide mb-6">
          Changer le mot de passe
        </h2>

        <div className="space-y-5">
          <div>
            <label htmlFor="currentPassword" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Mot de passe actuel
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border-2 border-gray-200 dark:border-gray-800 bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Nouveau mot de passe
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              className="w-full border-2 border-gray-200 dark:border-gray-800 bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:border-black dark:focus:border-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Laisser vide pour conserver l&apos;actuel. Minimum 8 caractères.
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[#FF0033] text-white text-sm font-black uppercase tracking-widest disabled:opacity-60 hover:bg-black transition-colors"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
