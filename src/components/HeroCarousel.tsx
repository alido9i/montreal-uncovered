"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface HeroSlide {
  title: string;
  slug: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  category: string;
  categorySlug: string;
  readingTime?: number;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

const AUTOPLAY_MS = 6000;

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, next, slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-30%" : "30%", opacity: 0 }),
  };

  return (
    <section
      className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background slides */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          {slide.imageUrl ? (
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={current === 0}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
          )}

          {/* Cinematic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

          {/* Vignette */}
          <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 200px rgba(0,0,0,0.5)" }} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16 md:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl"
          >
            {/* Category + Reading time */}
            <div className="flex items-center gap-3 mb-4">
              <motion.span
                className="text-xs font-black uppercase tracking-[0.2em] text-white px-3 py-1 bg-[#FF0033]"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {slide.category}
              </motion.span>
              {slide.readingTime && (
                <span className="text-xs text-gray-400 font-medium">{slide.readingTime} min de lecture</span>
              )}
            </div>

            {/* Title */}
            <Link href={`/article/${slide.slug}`}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-4 hover:text-[#FF0033] transition-colors duration-300">
                {slide.title}
              </h1>
            </Link>

            {/* Excerpt */}
            {slide.excerpt && (
              <p className="text-base md:text-lg text-gray-300 max-w-xl leading-relaxed mb-6">
                {slide.excerpt}
              </p>
            )}

            {/* CTA */}
            <Link
              href={`/article/${slide.slug}`}
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white border-b-2 border-[#FF0033] pb-1 hover:text-[#FF0033] transition-colors group"
            >
              Lire l'article
              <motion.svg
                width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                className="group-hover:translate-x-1 transition-transform"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </motion.svg>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots + progress */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 right-6 flex items-center gap-2">
            {/* Slide counter */}
            <span className="text-xs font-mono text-gray-500 mr-2">
              {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>

            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="relative w-8 h-1 bg-white/20 overflow-hidden rounded-full"
                aria-label={`Slide ${i + 1}`}
              >
                {i === current && (
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-[#FF0033] rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                    key={`progress-${current}`}
                  />
                )}
                {i < current && <div className="absolute inset-0 bg-white/50 rounded-full" />}
              </button>
            ))}
          </div>
        )}

        {/* Prev / Next arrows */}
        {slides.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 pointer-events-none">
            <motion.button
              onClick={() => { setDirection(-1); setCurrent((current - 1 + slides.length) % slides.length); }}
              className="pointer-events-auto w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </motion.button>
            <motion.button
              onClick={next}
              className="pointer-events-auto w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
}
