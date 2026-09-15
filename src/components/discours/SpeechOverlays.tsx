"use client";

/**
 * Cartes d'incrustation du discours augmenté.
 *
 * Elles sont volontairement sobres : un accent rouge, un chiffre, une source.
 * Toutes respectent `prefers-reduced-motion` (compteurs figés, pas de translation)
 * — un lecteur qui a désactivé les animations doit lire exactement la même
 * information, pas une version dégradée.
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import type { Cue } from "./speechData";
import { SOURCES } from "./speechData";

/* ------------------------------------------------------------------ compteur */

function format(value: number, decimals: number) {
  return new Intl.NumberFormat("fr-CA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, (v) => format(v, decimals));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    // Décélération marquée : le chiffre « atterrit » au lieu de s'arrêter net.
    const controls = animate(mv, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [value, reduce, mv]);

  return <motion.span className="tabular-nums">{text}</motion.span>;
}

/* -------------------------------------------------------------- présentation */

const PANEL =
  "rounded-sm border border-white/15 bg-black/72 text-white backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.45)]";

const KICKER =
  "text-[10px] font-black uppercase tracking-[0.18em] text-[#FF0033]";

function SourceLine({ sourceId }: { sourceId: keyof typeof SOURCES }) {
  const [open, setOpen] = useState(false);
  const source = SOURCES[sourceId];

  return (
    <div className="mt-2 border-t border-white/10 pt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/55 transition-colors hover:text-white"
      >
        <span
          aria-hidden
          className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}
        >
          ›
        </span>
        Source
      </button>
      {open && (
        <p className="mt-1.5 text-[11px] leading-snug text-white/70">
          {source.publisher} —{" "}
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/30 underline-offset-2 hover:text-white"
          >
            {source.label}
          </a>
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- cartes */

function LowerThird({ cue }: { cue: Extract<Cue, { kind: "lowerThird" }> }) {
  return (
    <div className={`${PANEL} border-l-[3px] border-l-[#FF0033] px-4 py-3`}>
      <p className="text-lg font-black leading-none tracking-tight sm:text-xl">
        {cue.name}
      </p>
      <p className="mt-1.5 text-[12px] font-semibold text-white/80">{cue.role}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-widest text-white/45">
        {cue.place}
      </p>
    </div>
  );
}

function StatCard({ cue }: { cue: Extract<Cue, { kind: "stat" }> }) {
  return (
    <div className={`${PANEL} px-4 py-3.5`}>
      <p className="flex items-baseline font-black leading-none tracking-tighter">
        <span className="text-[2.4rem] sm:text-[2.75rem]">
          <Counter value={cue.value} decimals={cue.decimals ?? 0} />
        </span>
        {cue.suffix && (
          <span className="text-2xl text-[#FF0033] sm:text-3xl">{cue.suffix}</span>
        )}
      </p>
      <p className="mt-1.5 text-[13px] font-semibold leading-snug text-white/90">
        {cue.label}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-white/50">{cue.note}</p>
      <SourceLine sourceId={cue.sourceId} />
    </div>
  );
}

function Stamp({ cue }: { cue: Extract<Cue, { kind: "stamp" }> }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { scale: 1.07 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`${PANEL} inline-flex items-center gap-3 px-4 py-2.5`}
    >
      <span className="text-base font-black uppercase tracking-[0.06em] sm:text-lg">
        {cue.text}
      </span>
      <span className="h-5 w-px bg-white/20" aria-hidden />
      <span className="text-[11px] font-black tabular-nums text-[#FF0033]">
        {cue.index}
        <span className="text-white/35"> / {cue.total}</span>
      </span>
    </motion.div>
  );
}

function YearsCard({ cue }: { cue: Extract<Cue, { kind: "years" }> }) {
  const reduce = useReducedMotion();
  return (
    <div className={`${PANEL} px-4 py-3.5`}>
      <p className={KICKER}>{cue.label}</p>
      <div className="mt-2 flex items-center gap-2.5">
        <span className="text-xl font-black tabular-nums sm:text-2xl">{cue.from}</span>
        <span className="relative h-px flex-1 bg-white/20">
          <motion.span
            className="absolute inset-y-0 left-0 bg-[#FF0033]"
            initial={reduce ? { width: "100%" } : { width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </span>
        <span className="text-xl font-black tabular-nums sm:text-2xl">{cue.to}</span>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-white/55">{cue.note}</p>
    </div>
  );
}

function PhotoCard({ cue }: { cue: Extract<Cue, { kind: "photo" }> }) {
  return (
    <figure className={`${PANEL} overflow-hidden`}>
      <div className="relative aspect-[4/3] w-full bg-white/5">
        <Image
          src={cue.src}
          alt={cue.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <figcaption className="px-3.5 py-2.5">
        <p className="text-[12px] font-semibold leading-snug text-white/90">
          {cue.caption}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-white/40">
          <a
            href={cue.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/70"
          >
            {cue.credit} · {cue.license}
          </a>
        </p>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ aiguillage */

export default function CueCard({ cue }: { cue: Cue }) {
  switch (cue.kind) {
    case "lowerThird":
      return <LowerThird cue={cue} />;
    case "stat":
      return <StatCard cue={cue} />;
    case "stamp":
      return <Stamp cue={cue} />;
    case "years":
      return <YearsCard cue={cue} />;
    case "photo":
      return <PhotoCard cue={cue} />;
  }
}

export { PANEL, KICKER, SourceLine };
