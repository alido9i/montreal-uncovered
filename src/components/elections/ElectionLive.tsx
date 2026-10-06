"use client";

import Image from "next/image";
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
type Chef = { nom: string; photo: string; credit: string; licence: string; source: string };
const PARTIS: Record<number, { label: string; nom: string; color: string; chef?: Chef }> = {
  8: {
    label: "PQ", nom: "Parti québécois", color: "#0A4DA2",
    chef: { nom: "Paul St-Pierre Plamondon", photo: "/images/elections/pq.jpg", credit: "UnPingouin", licence: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Paul.St-Pierre.Plamondon.cropped.jpg" },
  },
  6: {
    label: "PLQ", nom: "Parti libéral du Québec", color: "#D71920",
    chef: { nom: "Charles Milliard", photo: "/images/elections/plq.jpg", credit: "Amélie Caron", licence: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:A9306522-Modifier-30_(cropped).jpg" },
  },
  22: {
    label: "PCQ", nom: "Parti conservateur du Québec", color: "#5A4FCF",
    chef: { nom: "Éric Duhaime", photo: "/images/elections/pcq.jpg", credit: "Asclepias", licence: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:%C3%89ric_Duhaime_2022-07-05_(cropped).jpg" },
  },
  40: {
    label: "QS", nom: "Québec solidaire", color: "#FF5505",
    chef: { nom: "Ruba Ghazal", photo: "/images/elections/qs.jpg", credit: "QuebecSolidaireMercier", licence: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:RubaGhazal_2.jpg" },
  },
  27: {
    label: "CAQ", nom: "Coalition avenir Québec", color: "#00A9CE",
    chef: { nom: "Christine Fréchette", photo: "/images/elections/caq.jpg", credit: "TVA Nouvelles", licence: "CC BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Christine_Fr%C3%A9chette_2024.jpg" },
  },
};
const AUTRE: { label: string; nom: string; color: string; chef?: Chef } = { label: "Autres", nom: "Autres", color: "#9ca3af" };
const partiInfo = (n: number, abrev?: string) =>
  PARTIS[n] ?? { ...AUTRE, label: abrev && abrev.length < 8 ? abrev : "Autres" };

const norm = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
// Photo libre de droits seulement pour les chefs ; initiales pour les autres candidats.
function photoDe(k: Candidat) {
  const chef = PARTIS[k.numeroPartiPolitique]?.chef;
  return chef && norm(chef.nom) === norm(`${k.prenom} ${k.nom}`) ? chef.photo : undefined;
}

function Avatar({ photo, nom, color, size }: { photo?: string; nom: string; color: string; size: number }) {
  const initiales = nom.split(/[\s-]+/).filter(Boolean).map((m) => m[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-black text-white"
      style={{ width: size, height: size, background: color, boxShadow: `0 0 0 2px ${color}`, fontSize: size * 0.36 }}
    >
      {photo ? (
        <Image src={photo} alt={nom} width={size * 2} height={size * 2} className="h-full w-full object-cover object-top" />
      ) : (
        initiales
      )}
    </span>
  );
}

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

  const { seats, partis, total, majority } = useMemo(() => {
    const total = data?.statistiques.nbCirconscription ?? 127;
    const seats = (data?.statistiques.partisPolitiques ?? [])
      .filter((p) => p.nbCirconscriptionsEnAvance > 0)
      .sort((a, b) => b.nbCirconscriptionsEnAvance - a.nbCirconscriptionsEnAvance);
    const partis = (data?.statistiques.partisPolitiques ?? [])
      .filter((p) => PARTIS[p.numeroPartiPolitique])
      .sort((a, b) => b.nbCirconscriptionsEnAvance - a.nbCirconscriptionsEnAvance || b.nbVoteTotal - a.nbVoteTotal);
    return { seats, partis, total, majority: Math.floor(total / 2) + 1 };
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
          <section className="-mx-4 mt-4 overflow-x-auto px-4 pb-2 pt-3 md:mx-0 md:overflow-visible md:px-0">
            <div className="flex gap-3 md:grid md:grid-cols-5">
              {partis.map((p, idx) => {
                const i = partiInfo(p.numeroPartiPolitique, p.abreviationPartiPolitique);
                const premier = idx === 0 && p.nbCirconscriptionsEnAvance > 0;
                return (
                  <div
                    key={p.numeroPartiPolitique}
                    className={`relative flex w-[176px] shrink-0 flex-col border bg-[var(--surface)] p-4 md:w-auto ${premier ? "border-2" : "border-[var(--border)]"}`}
                    style={premier ? { borderColor: i.color } : undefined}
                  >
                    {premier && (
                      <span
                        className="absolute -top-2.5 left-3 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white"
                        style={{ background: i.color }}
                      >
                        En tête
                      </span>
                    )}
                    <p className="min-h-[2.5em] text-[11px] font-black uppercase leading-tight tracking-widest" style={{ color: i.color }}>
                      {i.nom}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Avatar photo={i.chef?.photo} nom={i.chef?.nom ?? i.label} color={i.color} size={56} />
                      <span className="text-4xl font-black tabular-nums leading-none lg:text-5xl">{p.nbCirconscriptionsEnAvance}</span>
                    </div>
                    <p className="mt-2 truncate text-xs font-bold">{i.chef?.nom}</p>
                    <p className="text-xs text-[var(--muted)]">{p.nbCirconscriptionsEnAvance} en avance</p>
                    <div className="relative mt-3 h-2 w-full bg-[var(--surface-2)]">
                      <div
                        className="h-full"
                        style={{ width: `${Math.min(100, (p.nbCirconscriptionsEnAvance / majority) * 100)}%`, background: i.color }}
                      />
                      <span className="absolute -top-1 right-0 h-4 w-0.5 bg-black dark:bg-white" title={`Majorité : ${majority}`} />
                    </div>
                    <div className="mt-3 border-t border-[var(--border)] pt-2">
                      <span className="block whitespace-nowrap text-xl font-black tabular-nums">{pct(p.tauxVoteTotal)} %</span>
                      <span className="block whitespace-nowrap text-[11px] tabular-nums text-[var(--muted)]">{fmt(p.nbVoteTotal)} votes</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map(({ c, l }) => {
                const top = [...c.candidats].sort((a, b) => b.nbVoteTotal - a.nbVoteTotal).slice(0, 3);
                const waiting = c.nbVoteValide === 0 || l.first.nbVoteTotal === 0;
                const pi = waiting ? AUTRE : partiInfo(l.first.numeroPartiPolitique, l.first.abreviationPartiPolitique);
                const avance = c.nbBureauTotal ? (c.nbBureauComplete / c.nbBureauTotal) * 100 : 0;
                return (
                  <article
                    key={c.numeroCirconscription}
                    className="flex min-w-0 flex-col border border-[var(--border)] bg-[var(--surface)]"
                    style={{ borderTop: `4px solid ${pi.color}` }}
                  >
                    <div className="flex items-start justify-between gap-2 px-4 pt-3">
                      <h3 className="text-base font-black uppercase leading-tight tracking-tight">{c.nomCirconscription}</h3>
                      {!waiting && (
                        <span
                          className="whitespace-nowrap px-2 py-0.5 text-[11px] font-black text-white tabular-nums"
                          style={{ background: pi.color }}
                        >
                          {c.isResultatsFinaux ? "Élu·e" : `${pi.label} + ${fmt(l.gap)}`}
                        </span>
                      )}
                    </div>
                    <ul className="flex-1 space-y-2.5 px-4 py-3">
                      {top.map((k, idx) => {
                        const i = partiInfo(k.numeroPartiPolitique, k.abreviationPartiPolitique);
                        const lead = idx === 0 && !waiting;
                        return (
                          <li key={k.numeroCandidat} className="flex items-center gap-3">
                            <Avatar photo={photoDe(k)} nom={`${k.prenom} ${k.nom}`} color={i.color} size={lead ? 44 : 32} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className={`truncate text-sm ${lead ? "font-black" : "font-semibold"}`}>
                                  {k.prenom} {k.nom}
                                </span>
                                <span className={`whitespace-nowrap tabular-nums ${lead ? "text-base font-black" : "text-sm"}`}>
                                  {waiting ? "–" : `${pct(k.tauxVote)} %`}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: i.color }}>
                                  {i.label}
                                </span>
                                <div className="h-1.5 flex-1 bg-[var(--surface-2)]">
                                  <div className="h-full" style={{ width: `${waiting ? 0 : k.tauxVote}%`, background: i.color }} />
                                </div>
                                {!waiting && (
                                  <span className="text-[10px] tabular-nums text-[var(--muted)]">{fmt(k.nbVoteTotal)}</span>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="border-t border-[var(--border)] px-4 py-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        <span>{waiting ? "En attente des premiers résultats" : c.isResultatsFinaux ? "Résultat final" : "Bureaux dépouillés"}</span>
                        <span className="tabular-nums">{c.nbBureauComplete}/{c.nbBureauTotal}</span>
                      </div>
                      <div className="mt-1 h-1 bg-[var(--surface-2)]">
                        <div className="h-full bg-black dark:bg-white" style={{ width: `${avance}%` }} />
                      </div>
                    </div>
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
        <span className="mt-2 block">
          Photos des chefs : Wikimedia Commons —{" "}
          {Object.values(PARTIS).map((p, idx, arr) =>
            p.chef ? (
              <span key={p.label}>
                <a href={p.chef.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#FF0033]">
                  {p.chef.nom}
                </a>{" "}
                ({p.chef.credit}, {p.chef.licence}){idx < arr.length - 1 ? " · " : ""}
              </span>
            ) : null,
          )}
        </span>
      </footer>
    </div>
  );
}
