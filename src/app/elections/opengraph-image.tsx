import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Image d'aperçu (Facebook, X, iMessage…) avec les sièges en direct.
// Régénérée au plus toutes les 5 minutes ; si la source est indisponible,
// on affiche la version sans chiffres.
export const revalidate = 300;
export const alt = "Élections Québec 2026 : résultats en direct sur Montréal Uncovered";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SOURCE =
  "https://donnees.electionsquebec.qc.ca/production/provincial/resultats/resultats.json";

const PARTIS = [
  { num: 8, label: "PQ", color: "#0A4DA2", photo: "pq.jpg" },
  { num: 6, label: "PLQ", color: "#D71920", photo: "plq.jpg" },
  { num: 22, label: "PCQ", color: "#5A4FCF", photo: "pcq.jpg" },
  { num: 40, label: "QS", color: "#FF5505", photo: "qs.jpg" },
  { num: 27, label: "CAQ", color: "#00A9CE", photo: "caq.jpg" },
];

type Stats = {
  partisPolitiques: { numeroPartiPolitique: number; nbCirconscriptionsEnAvance: number; tauxVoteTotal: number }[];
  tauxBureauVoteRempli: number;
  nbCirconscription: number;
  isResultatsFinaux: boolean;
  iso8601DateMAJ: string;
};

async function getStats(): Promise<Stats | null> {
  try {
    const res = await fetch(SOURCE, {
      next: { revalidate: 300 },
      headers: { "User-Agent": "MontrealUncovered/1.0" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j.statistiques ?? null;
  } catch {
    return null;
  }
}

const pct = (n: number) => n.toLocaleString("fr-CA", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default async function Image() {
  const [black, bold, stats, ...photos] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Geist-Black.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Geist-Bold.ttf")),
    getStats(),
    ...PARTIS.map((p) => readFile(join(process.cwd(), "public/images/elections", p.photo))),
  ]);

  const total = stats?.nbCirconscription ?? 127;
  const majority = Math.floor(total / 2) + 1;
  const partis = PARTIS.map((p, i) => {
    const s = stats?.partisPolitiques.find((x) => x.numeroPartiPolitique === p.num);
    return {
      ...p,
      seats: s?.nbCirconscriptionsEnAvance ?? 0,
      vote: s?.tauxVoteTotal ?? 0,
      src: `data:image/jpeg;base64,${photos[i].toString("base64")}`,
    };
  }).sort((a, b) => b.seats - a.seats || b.vote - a.vote);
  const hasData = !!stats && partis.some((p) => p.seats > 0);
  const maj = stats ? new Date(stats.iso8601DateMAJ.replace(",", ".")) : null;
  const heure = maj
    ? maj.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", timeZone: "America/Toronto" })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          color: "white",
          padding: "48px 56px",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 900, letterSpacing: -1 }}>
            MTL<span style={{ color: "#FF0033" }}>UNCOVERED</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#FF0033",
              padding: "8px 18px",
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: 3,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 999, background: "white" }} />
            {stats?.isResultatsFinaux ? "RÉSULTATS FINAUX" : "EN DIRECT"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 26 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 900, lineHeight: 1, letterSpacing: -2 }}>ÉLECTIONS QUÉBEC 2026</div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#a3a3a3", marginTop: 12 }}>
            {hasData
              ? `Sièges en avance · ${pct(stats!.tauxBureauVoteRempli)} % des bureaux dépouillés${heure ? ` · ${heure.replace(":", " h ")}` : ""}`
              : "Résultats en direct, circonscription par circonscription"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 34 }}>
          {partis.map((p) => (
            <div
              key={p.num}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "#171717",
                borderTop: `6px solid ${p.color}`,
                padding: "16px 16px",
              }}
            >
              <img
                src={p.src}
                width={72}
                height={72}
                style={{ borderRadius: 999, objectFit: "cover", objectPosition: "top", border: `4px solid ${p.color}` }}
                alt=""
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 22, fontWeight: 900, color: p.color, letterSpacing: 2 }}>{p.label}</div>
                <div style={{ display: "flex", fontSize: hasData ? 52 : 30, fontWeight: 900, lineHeight: 1 }}>
                  {hasData ? p.seats : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasData && (
          <div style={{ display: "flex", position: "relative", height: 22, marginTop: 26, background: "#262626" }}>
            {partis.map((p) => (
              <div key={p.num} style={{ width: `${(p.seats / total) * 100}%`, height: "100%", background: p.color }} />
            ))}
            <div
              style={{
                position: "absolute",
                left: `${(majority / total) * 100}%`,
                top: -6,
                width: 4,
                height: 34,
                background: "white",
              }}
            />
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "auto",
            fontSize: 22,
            fontWeight: 700,
            color: "#a3a3a3",
          }}
        >
          <span>{hasData ? `Majorité : ${majority} sièges sur ${total}` : "Source : Élections Québec"}</span>
          <span style={{ color: "white" }}>montreal-uncovered.vercel.app/elections</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: black, style: "normal", weight: 900 },
        { name: "Geist", data: bold, style: "normal", weight: 700 },
      ],
    },
  );
}
