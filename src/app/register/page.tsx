"use client";

import { useState, useEffect } from "react";
import { signIn, getProviders } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSocialProviders, setHasSocialProviders] = useState(false);

  useEffect(() => {
    getProviders().then((providers) => {
      if (providers) {
        const oauthIds = Object.keys(providers).filter((id) => id !== "credentials");
        setHasSocialProviders(oauthIds.length > 0);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black">
            MTL<span style={{ color: "#FF0033" }}>UNCOVERED</span>
          </Link>
        </div>

        <div className="bg-white border-2 border-black p-8">
          <h1 className="text-2xl font-black mb-6">Créer un compte</h1>

          {/* Social Login */}
          <SocialLoginButtons />

          {/* Divider */}
          {hasSocialProviders && (
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400 font-semibold uppercase">ou</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
          )}

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-bold mb-1">
                Nom <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="8 caractères minimum"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-black text-sm uppercase tracking-widest disabled:opacity-60"
              style={{ backgroundColor: "#FF0033" }}
            >
              {loading ? "Création…" : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-bold underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
