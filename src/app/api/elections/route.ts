import { NextResponse } from "next/server";

// Proxy + cache serveur des résultats officiels d'Élections Québec.
// Élections Québec actualise les fichiers aux 2 à 5 minutes le soir du vote et
// demande de ne pas les rafraîchir trop souvent : on met en cache 60 s côté
// serveur, peu importe le nombre de visiteurs.
export const dynamic = "force-dynamic";

const SOURCE =
  "https://donnees.electionsquebec.qc.ca/production/provincial/resultats/resultats.json";
const TTL_MS = 60_000;

let cache: { at: number; body: unknown } | null = null;

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) {
    return NextResponse.json(cache.body, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  }
  try {
    const res = await fetch(SOURCE, {
      cache: "no-store",
      headers: { "User-Agent": "MontrealUncovered/1.0 (+https://montrealuncovered.com)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    const body = await res.json();
    cache = { at: now, body };
    return NextResponse.json(body, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    // En cas d'échec, on sert la dernière version connue plutôt que rien.
    if (cache) {
      return NextResponse.json(cache.body, { headers: { "X-Stale": "1" } });
    }
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}
