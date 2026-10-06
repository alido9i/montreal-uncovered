"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Candidat = {
  numeroCandidat: number;
  nom: string;
  prenom: string;
  numeroPartiPolitique: number;
  abreviationPartiPolitique: string;
  nbVoteTotal: number;
  tauxVote: number;
};
type Circ = {
  numeroCirconscription: number;
  nomCirconscription: string;
  isResultatsFinaux: boolean;
  nbBureauComplete: number;
  nbBureauTotal: number;
  nbVoteValide: number;
  candidats: Candidat[];
};
type Parti = {
  numeroPartiPolitique: number;
  nomPartiPolitique: string;
  abreviationPartiPolitique: string;
  nbVoteTotal: number;
  tauxVoteTotal: number;
  nbCirconscriptionsEnAvance: number;
};
type Stats = {
  partisPolitiques: Parti[];
  nbBureauVote: number;
  nbBureauVoteRempli: number;
  tauxBureauVoteRempli: number;
  nbVoteValide: number;
  nbElecteurInscrit: number;
  tauxParticipationTotal: string;
  nbCirconscription: number;
  nbCirconscriptionAvecResultat: number;
  isResultatsFinaux: boolean;
  iso8601DateMAJ: string;
};
type Data = { statistiques: Stats; circonscriptions: Circ[] };

// numeroPartiPolitique -> libellé court + couleur
const PARTIS: Record<number, { label: string; color: string }> = {
  8: { label: "PQ", color: "#0A4DA2" },
  6: { label: "PLQ", color: "#D71920" },
  27: { label: "CAQ", color: "#00A9CE" },
  22: { label: "PCQ", color: "#5A4FCF" },
  40: { label: "QS", color: "#FF5505" },
};
const AUTRE = { label: "Autres", color: "#9ca3af" };
const partiInfo = (n: number, abrev?: string) =>
  PARTIS[n] ?? { ...AUTRE, label: abrev && abrev.length < 8 ? abrev : "Autres" };

const CHEFS = ["fréchette", "milliard", "plamondon", "duhaime", "ghazal"];
const fmt = (n: number) => n.toLocaleString("fr-CA");
const pct = (n: number) => n.toLocaleString("fr-CA", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function lead(c: Circ) {
  const s = [...c.candidats].sort((a, b) => b.nbVoteTotal - a.nbVoteTotal);
  return { first: s[0], second: s[1], gap: s[0] && s[1] ? s[0].nbVoteTotal - s[1].nbVoteTotal : 0 };
}

export default function ElectionLive() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "close" | "chefs">("all");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/elections", { cache: "no-store" });
      if (!r.ok) throw new Error();
      const j = await r.json();
      if (!j.statistiques) throw new Error();
      setData(j);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  const { seats, total, majority } = useMemo(() => {
    const total = data?.statistiques.nbCirconscription ?? 127;
    const seats = (data?.statistiques.partisPolitiques ?? [])
      .filter((p) => p.nbCirconscriptionsEnAvance > 0)
      .sort((a, b) => b.nbCirconscriptionsEnAvance - a.nbCirconscriptionsEnAvance);
    return { seats, total, majority: Math.floor(total / 2) + 1 };
  }, [data]);

  const rows = useMemo(() => {
    if (!data) return [];
    const nq = q.trim().toLowerCase();
    let list = data.circonscriptions.map((c) => ({ c, l: lead(c) }));
    if (nq) {
      list = list.filter(
        ({ c }) =>
          c.nomCirconscription.toLowerCase().includes(nq) ||
          c.candidats.some((k) => `${k.prenom} ${k.nom}`.toLowerCase().includes(nq)),
      );
    }
    if (filter === "chefs") {
      list = list.filter(({ c }) =>
        c.candidats.some((k) => CHEFS.some((n) => `${k.prenom} ${k.nom}`.toLowerCase().includes(n))),
      );
    }
    if (filter === "close") {
      list = list
        .filter(({ c, l }) => c.nbVoteValide > 0 && l.second && l.gap / Math.max(1, l.first.nbVoteTotal + l.second.nbVoteTotal) < 0.05)
        .sort((a, b) => a.l.gap - b.l.gap);
    } else {
      list.sort((a, b) => a.c.nomCirconscription.localeCompare(b.c.nomCirconscription, "fr"));
    }
    return list;
  }, [data, q, filter]);

  const s = data?.statistiques;
  const maj = s ? new Date(s.iso8601DateMAJ.replace(",", ".")) : null;

  return (
    <div>
      <header className="border-b-4 border-black pb-4 dark:border-white">
        <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#FF0033]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF0033] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FF0033]" />
          </span>
          {s?.isResultatsFinaux ? "Résultats finaux" : "En direct"} · Élections Québec 2026
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
          Résultats de l&apos;élection
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {s && maj
            ? `${pct(s.tauxBureauVoteRempli)} % des bureaux de vote dépouillés (${fmt(s.nbBureauVoteRempli)} sur ${fmt(s.nbBureauVote)}) · Participation : ${pct(Number(s.tauxParticipationTotal))} % · Mis à jour à ${maj.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
            : error
              ? "Résultats momentanément indisponibles. Nouvelle tentative en cours…"
              : "Chargement des résultats…"}
        </p>
        {error && data && (
          <p className="mt-1 text-xs font-bold text-[#FF0033]">
            Connexion à la source interrompue : affichage de la dernière mise à jour.
          </p>
        )}
      </header>

      {s && (
        <>
          <section className="mt-8">
            <div className="mb-2 flex items-end justify-between">
              <h2 className="border-l-4 border-l-[#FF0033] pl-3 text-xl font-black uppercase tracking-tight">
                Sièges en avance
              </h2>
              <span className="text-xs font-bold text-[var(--muted)]">Majorité : {majority} sur {total}</span>
            </div>
            <div className="relative h-10 w-full overflow-hidden border border-[var(--border)] bg-[var(--surface-2)]">
              <div className="flex h-full w-full">
                {seats.map((p) => {
                  const i = partiInfo(p.numeroPartiPolitique, p.abreviationPartiPolitique);
                  return (
                    <div
                      key={p.numeroPartiPolitique}
                      style={{ width: `${(p.nbCirconscriptionsEnAvance / total) * 100}%`, background: i.color }}
                      className="flex items-center justify-center text-xs font-black text-white"
                      title={`${p.nomPartiPolitique} : ${p.nbCirconscriptionsEnAvance}`}
                    >
                      {p.nbCirconscriptionsEnAvance >= 4 ? p.nbCirconscriptionsEnAvance : ""}
                    </div>
                  );
                })}
              </div>
              <div
                className="absolute inset-y-0 w-0.5 bg-black dark:bg-white"
                style={{ left: `${(majority / total) * 100}%` }}
                aria-label="Seuil de majorité"
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              « En avance » : le parti mène dans la circonscription d&apos;après les bureaux déjà dépouillés. Ce n&apos;est
              pas une élection confirmée tant que les résultats ne sont pas finaux.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-3 border-l-4 border-l-[#FF0033] pl-3 text-xl font-black uppercase tracking-tight">
              Vote populaire
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {s.partisPolitiques.slice(0, 5).map((p) => {
                const i = partiInfo(p.numeroPartiPolitique, p.abreviationPartiPolitique);
                return (
                  <div
                    key={p.numeroPartiPolitique}
                    className="border border-[var(--border)] bg-[var(--surface)] p-3"
                    style={{ borderTop: `4px solid ${i.color}` }}
                  >
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: i.color }}>
                      {i.label}
                    </p>
                    <p className="mt-1 text-3xl font-black">{pct(p.tauxVoteTotal)} %</p>
                    <p className="text-xs text-[var(--muted)]">
                      {fmt(p.nbVoteTotal)} votes · {p.nbCirconscriptionsEnAvance} en avance
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="mb-3 border-l-4 border-l-[#FF0033] pl-3 text-xl font-black uppercase tracking-tight">
              Circonscriptions
            </h2>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Chercher une circonscription ou un candidat"
                className="w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[#FF0033] sm:max-w-sm"
              />
              <div className="flex gap-2 text-xs font-black uppercase tracking-wider">
                {(
                  [
                    ["all", "Toutes"],
                    ["close", "Courses serrées"],
                    ["chefs", "Chefs"],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`border px-3 py-2 ${
                      filter === k
                        ? "border-[#FF0033] bg-[#FF0033] text-white"
                        : "border-[var(--border)] bg-[var(--surface)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <p className="mb-3 text-xs text-[var(--muted)]">
              {s.nbCirconscriptionAvecResultat ?? data?.circonscriptions.length} circonscriptions sur {total} ont
              commencé à rapporter. {filter === "close" && "Écart de moins de 5 % entre les deux premiers."}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {rows.map(({ c, l }) => {
                const top = [...c.candidats].sort((a, b) => b.nbVoteTotal - a.nbVoteTotal).slice(0, 3);
                const waiting = c.nbVoteValide === 0 || l.first.nbVoteTotal === 0;
                const pi = waiting ? AUTRE : partiInfo(l.first.numeroPartiPolitique, l.first.abreviationPartiPolitique);
                return (
                  <article
                    key={c.numeroCirconscription}
                    className="border border-[var(--border)] bg-[var(--surface)] p-3"
                    style={{ borderLeft: `4px solid ${pi.color}` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black uppercase tracking-tight">{c.nomCirconscription}</h3>
                      <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        {waiting ? "En attente" : c.isResultatsFinaux ? "Final" : `${c.nbBureauComplete}/${c.nbBureauTotal} bureaux`}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {top.map((k, idx) => {
                        const i = partiInfo(k.numeroPartiPolitique, k.abreviationPartiPolitique);
                        return (
                          <li key={k.numeroCandidat} className="flex items-center gap-2 text-sm">
                            <span
                              className="inline-block w-12 text-center text-[10px] font-black text-white"
                              style={{ background: i.color }}
                            >
                              {i.label}
                            </span>
                            <span className={`flex-1 truncate ${idx === 0 && !waiting ? "font-bold" : ""}`}>
                              {k.prenom} {k.nom}
                            </span>
                            <span className="tabular-nums">{waiting ? "–" : `${pct(k.tauxVote)} %`}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                );
              })}
              {rows.length === 0 && (
                <p className="text-sm text-[var(--muted)]">Aucune circonscription ne correspond.</p>
              )}
            </div>
          </section>
        </>
      )}

      <footer className="mt-10 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
        Source : Élections Québec (données ouvertes), actualisées aux 2 à 5 minutes. Résultats non officiels
        jusqu&apos;à la publication des résultats finaux. Cette page se rafraîchit automatiquement.
      </footer>
    </div>
  );
}
