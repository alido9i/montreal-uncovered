"use client";

import { useState, useEffect } from "react";
import { signIn, getProviders } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function LoginPage() {
  const router = useRouter();
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

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/");
      router.refresh();
    }
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
          <h1 className="text-2xl font-black mb-6">Connexion</h1>

          {/* Social Login — s'affiche seulement si configuré */}
          <SocialLoginButtons />

          {/* Divider — seulement si providers sociaux existent */}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-black text-sm uppercase tracking-widest disabled:opacity-60"
              style={{ backgroundColor: "#FF0033" }}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-bold underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
