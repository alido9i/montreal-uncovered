"use client";

/**
 * Lecteur « discours augmenté ».
 *
 * Principe : la vidéo reste la source, les incrustations sont calées dessus au
 * timecode. Les contrôles natifs sont désactivés — en plein écran natif le
 * navigateur n'affiche que le <video>, ce qui ferait disparaître toutes les
 * incrustations ; on met donc le conteneur en plein écran, pas la vidéo.
 *
 * Boucle de synchro : un rAF qui tourne uniquement pendant la lecture. Il écrit
 * la barre de progression directement dans le DOM (aucun rendu React à 60 fps)
 * et ne déclenche un setState que lorsque l'ensemble des incrustations actives,
 * le sous-titre ou le chapitre changent réellement.
 */

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CueCard from "./SpeechOverlays";
import {
  CAPTIONS,
  CHAPTERS,
  CUES,
  DURATION,
  END_CARD,
  POSTER_SRC,
  SOURCES,
  VIDEO_SRC,
  type Cue,
} from "./speechData";

type CaptionLang = "fr" | "en" | "off";

/**
 * Position des incrustations. Sous la vidéo en flux normal sur mobile — à 30 %
 * de 360 px une carte de statistique serait illisible — superposées à partir de
 * md, dans des zones qui ne recouvrent pas le visage de l'orateur.
 */
const SLOTS: { slot: Cue["slot"]; className: string }[] = [
  {
    slot: "right",
    className:
      "md:pointer-events-auto md:absolute md:right-[2.5%] md:top-[7%] md:w-[30%]",
  },
  {
    slot: "bottomLeft",
    className:
      "md:pointer-events-auto md:absolute md:bottom-[24%] md:left-[3.5%] md:w-[40%]",
  },
];

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Index du dernier élément dont l'intervalle [start, end) contient t. */
function indexAt<T extends { start: number; end: number }>(list: T[], t: number) {
  return list.findIndex((item) => t >= item.start && t < item.end);
}

export default function AugmentedSpeech() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [captionLang, setCaptionLang] = useState<CaptionLang>("fr");
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [captionIdx, setCaptionIdx] = useState(-1);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showEndCard, setShowEndCard] = useState(false);

  // Mémorise le dernier état poussé à React pour ne re-rendre qu'au changement.
  const lastKey = useRef("");

  const sync = useCallback((t: number) => {
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${Math.min(1, t / DURATION)})`;
    }

    const ids = CUES.filter((c) => t >= c.start && t < c.end).map((c) => c.id);
    const cIdx = indexAt(CAPTIONS, t);
    const chIdx = indexAt(CHAPTERS, t);
    const secs = Math.floor(t);
    const end = t >= END_CARD.start;

    const key = `${ids.join(",")}|${cIdx}|${chIdx}|${secs}|${end}`;
    if (key === lastKey.current) return;
    lastKey.current = key;

    setActiveIds(ids);
    setCaptionIdx(cIdx);
    setChapterIdx(chIdx === -1 ? CHAPTERS.length - 1 : chIdx);
    setElapsed(secs);
    // La carte finale ne redisparaît pas d'elle-même : une fois révélée elle
    // reste, c'est la chute de la séquence. Seul un retour en arrière la retire.
    setShowEndCard(end);
  }, []);

  // rAF actif seulement pendant la lecture ; les autres transitions d'état
  // (seek, pause, fin) sont couvertes par les évènements du <video>.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v) sync(v.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, sync]);

  const seek = useCallback(
    (t: number) => {
      const v = videoRef.current;
      if (!v) return;
      const clamped = Math.max(0, Math.min(DURATION - 0.05, t));
      v.currentTime = clamped;
      sync(clamped);
    },
    [sync],
  );

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      setStarted(true);
      void v.play();
    } else {
      v.pause();
    }
  }, []);

  const restart = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    seek(0);
    setStarted(true);
    void v.play();
  }, [seek]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    // On ne détourne pas le clavier des contrôles eux-mêmes (Entrée/Espace sur
    // un bouton doit rester un clic).
    if ((e.target as HTMLElement).closest("button, a")) return;
    const v = videoRef.current;
    if (!v) return;
    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault();
        toggle();
        break;
      case "ArrowRight":
        e.preventDefault();
        seek(v.currentTime + 5);
        break;
      case "ArrowLeft":
        e.preventDefault();
        seek(v.currentTime - 5);
        break;
      case "m":
        e.preventDefault();
        setMuted((m) => !m);
        break;
      case "c":
        e.preventDefault();
        setCaptionLang((l) => (l === "fr" ? "en" : l === "en" ? "off" : "fr"));
        break;
    }
  };

  const scrubFromPointer = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    seek(((clientX - rect.left) / rect.width) * DURATION);
  };

  const activeCues = CUES.filter((c) => activeIds.includes(c.id));
  const bySlot = (slot: Cue["slot"]) => activeCues.filter((c) => c.slot === slot);
  const caption = captionIdx >= 0 ? CAPTIONS[captionIdx] : null;
  const captionText =
    captionLang === "off" || !caption ? null : caption[captionLang];

  const fade = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 14, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -8, scale: 0.99 },
      };

  return (
    <section className="w-full">
      {/* ---------------------------------------------------------- cadre vidéo */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label="Discours augmenté de Mark Carney"
        className="group relative bg-black outline-none ring-offset-2 ring-offset-[var(--background)] focus-visible:ring-2 focus-visible:ring-[#FF0033]"
      >
        <div className="relative aspect-video w-full overflow-hidden">
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            muted={muted}
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onSeeked={(e) => sync(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => sync(e.currentTarget.currentTime)}
            onEnded={() => {
              setPlaying(false);
              sync(DURATION);
            }}
            onClick={toggle}
          />

          {/* Voile de lisibilité pour les sous-titres, uniquement en bas. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"
          />

          {/* Sous-titres — toujours dans le cadre, y compris sur mobile. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[6%] flex justify-center px-[6%]">
            {captionText && (
              // Pas d'AnimatePresence ici : un sous-titre doit apparaître avec
              // la parole, pas attendre que le précédent ait fini de sortir.
              // Le changement de `key` suffit à rejouer le fondu d'entrée.
              <motion.p
                key={captionIdx}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
                lang={captionLang}
                className="max-w-3xl text-center text-[13px] font-semibold leading-snug text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] sm:text-base md:text-lg"
              >
                {captionText}
              </motion.p>
            )}
          </div>

          {/* Écran d'amorce. */}
          {!started && (
            <button
              type="button"
              onClick={toggle}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/35 transition-colors hover:bg-black/25"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF0033] shadow-lg transition-transform group-hover:scale-105">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                Lancer le discours augmenté
              </span>
            </button>
          )}
        </div>

        {/* ---------------------------------------------------- incrustations */}
        <div className="mt-3 grid gap-3 md:pointer-events-none md:absolute md:inset-0 md:mt-0 md:block">
          {SLOTS.map(({ slot, className }) => (
            <div key={slot} className={`empty:hidden grid ${className}`}>
              <AnimatePresence>
                {bySlot(slot).map((cue) => (
                  // Toutes les cartes d'un même emplacement occupent la même
                  // cellule de grille : deux cartes ne se chevauchent jamais
                  // dans le temps, sauf pendant le fondu croisé de 0,4 s — et
                  // là on veut justement qu'elles se superposent, sans décaler
                  // la mise en page ni recourir à `layout`/`popLayout` (dont la
                  // projection casse les animations déclaratives ici).
                  <motion.div
                    key={cue.id}
                    className="[grid-area:1/1] self-start"
                    {...fade}
                    transition={{ duration: 0.4 }}
                  >
                    <CueCard cue={cue} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------ contrôles */}
      <div className="border-x border-b border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
        {/* Barre de défilement + repères d'incrustation */}
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Position dans le discours"
          aria-valuemin={0}
          aria-valuemax={Math.round(DURATION)}
          aria-valuenow={elapsed}
          aria-valuetext={`${formatTime(elapsed)} sur ${formatTime(DURATION)}`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            scrubFromPointer(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              scrubFromPointer(e.clientX);
            }
          }}
          onKeyDown={(e) => {
            const v = videoRef.current;
            if (!v) return;
            if (e.key === "ArrowRight") {
              e.preventDefault();
              seek(v.currentTime + 5);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              seek(v.currentTime - 5);
            }
          }}
          className="relative h-6 cursor-pointer touch-none select-none"
        >
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--border)]">
            <div
              ref={progressRef}
              className="h-full origin-left rounded-full bg-[#FF0033]"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          {CUES.map((cue) => (
            <span
              key={cue.id}
              aria-hidden
              title={cue.kind}
              className="absolute top-1/2 h-2.5 w-[2px] -translate-y-1/2 bg-[var(--muted)]/60"
              style={{ left: `${(cue.start / DURATION) * 100}%` }}
            />
          ))}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Lecture"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF0033] text-white transition-transform hover:scale-105"
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={restart}
            className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)] transition-colors hover:text-[#FF0033]"
          >
            Reprendre
          </button>

          <span className="font-mono text-[11px] tabular-nums text-[var(--muted)]">
            {formatTime(elapsed)} / {formatTime(DURATION)}
          </span>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-pressed={muted}
              className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)] transition-colors hover:text-[#FF0033]"
            >
              {muted ? "Son coupé" : "Son"}
            </button>

            <div
              role="group"
              aria-label="Sous-titres"
              className="flex overflow-hidden rounded-sm border border-[var(--border)]"
            >
              {(["fr", "en", "off"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setCaptionLang(lang)}
                  aria-pressed={captionLang === lang}
                  className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    captionLang === lang
                      ? "bg-[#FF0033] text-white"
                      : "text-[var(--muted)] hover:text-[#FF0033]"
                  }`}
                >
                  {lang === "off" ? "Aucun" : lang}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                if (document.fullscreenElement) void document.exitFullscreen();
                else void containerRef.current?.requestFullscreen();
              }}
              className="hidden text-[11px] font-black uppercase tracking-widest text-[var(--muted)] transition-colors hover:text-[#FF0033] sm:block"
            >
              Plein écran
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------- fil de chapitres */}
      <nav aria-label="Chapitres du discours" className="mt-5">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
          Naviguer dans le discours
        </p>
        <ol className="flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:grid lg:grid-cols-7 lg:overflow-visible">
          {CHAPTERS.map((chapter, i) => {
            const current = i === chapterIdx;
            return (
              <li key={chapter.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => seek(chapter.start + 0.05)}
                  aria-current={current ? "true" : undefined}
                  className={`flex h-full w-40 flex-col items-start gap-1 border-t-2 px-2 py-2 text-left transition-colors lg:w-auto ${
                    current
                      ? "border-t-[#FF0033] text-[var(--foreground)]"
                      : "border-t-[var(--border)] text-[var(--muted)] hover:border-t-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <span className="font-mono text-[10px] tabular-nums">
                    {formatTime(chapter.start)}
                  </span>
                  <span className="text-[12px] font-bold leading-snug">
                    {chapter.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ------------------------------------------------------------ carte finale */}
      <AnimatePresence>
        {showEndCard && (
          <motion.aside
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex flex-col gap-5 border-l-4 border-l-[#FF0033] bg-[var(--surface-2)] p-5 sm:flex-row sm:items-start"
          >
            <div className="relative h-32 w-24 shrink-0 overflow-hidden bg-[var(--border)] grayscale">
              <Image
                src={END_CARD.photo.src}
                alt={END_CARD.photo.alt}
                fill
                sizes="96px"
                className="object-cover object-top"
              />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF0033]">
                {END_CARD.kicker}
              </p>
              <blockquote className="mt-2 font-serif text-2xl font-black leading-tight sm:text-3xl">
                « {END_CARD.quoteFr} »
              </blockquote>
              <p className="mt-1 text-[12px] italic text-[var(--muted)]">
                « {END_CARD.quoteEn} »
              </p>
              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--foreground)]/80">
                {END_CARD.body}
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <a
                  href={END_CARD.photo.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FF0033]"
                >
                  Photo : Jean Lesage · {END_CARD.photo.credit} ·{" "}
                  {END_CARD.photo.license}
                </a>
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------------- sources */}
      <div className="mt-6 rounded-sm border border-[var(--border)] p-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
          Sources des données affichées
        </h2>
        <ul className="mt-3 space-y-1.5 text-[13px]">
          {Object.entries(SOURCES).map(([id, source]) => (
            <li key={id} className="leading-snug">
              <span className="font-bold">{source.publisher}</span>{" "}
              <span className="text-[var(--muted)]">—</span>{" "}
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--muted)] underline decoration-[var(--border)] underline-offset-2 transition-colors hover:text-[#FF0033]"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] leading-snug text-[var(--muted)]">
          Extrait vidéo : conférence de presse du premier ministre, Ottawa,
          27 mars 2025. Transcription et traduction française réalisées pour cet
          article. Raccourcis clavier dans le lecteur : espace (lecture/pause),
          ← → (±5 s), M (son), C (sous-titres).
        </p>
      </div>
    </section>
  );
}
