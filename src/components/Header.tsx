"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import DarkModeToggle from "./DarkModeToggle";

interface SearchSuggestion {
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  category: { name: string };
}

const navLinks = [
  { label: "Montréal Local", href: "/montreal-local" },
  { label: "Culture", href: "/culture" },
  { label: "Gastronomie", href: "/gastronomie" },
  { label: "Société", href: "/societe" },
  { label: "Style de vie", href: "/style-de-vie" },
  { label: "Ailleurs", href: "/ailleurs" },
];

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
          setSelectedIndex(-1);
        }
      } catch {
        setSuggestions([]);
      }
    }, 250);
  }, []);

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      router.push(`/article/${suggestions[selectedIndex].slug}`);
    } else if (q.length >= 2) {
      router.push(`/recherche?q=${encodeURIComponent(q)}`);
    } else {
      return;
    }
    setSearchOpen(false);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Header hide/show on scroll
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 50);
    setHidden(latest > 200 && latest > previous);
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <motion.header
      className={`sticky top-0 z-50 text-white transition-all duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-xl shadow-lg shadow-black/10"
          : "bg-black"
      }`}
      initial={{ y: 0 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className={`max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 transition-all duration-300 ${
        scrolled ? "h-14" : "h-16"
      }`}>

        {/* Logo */}
        <Link href="/" className="text-xl font-black tracking-tight shrink-0 group">
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            MTL<span className="text-[#FF0033] group-hover:text-white transition-colors duration-300">UNCOVERED</span>
          </motion.span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold uppercase tracking-wide">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-3 py-2 hover:text-[#FF0033] transition-colors duration-200 group"
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#FF0033] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Search */}
          <div className="relative" ref={searchContainerRef}>
            <AnimatePresence>
              {searchOpen ? (
                <motion.form
                  key="search"
                  onSubmit={handleSearchSubmit}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 260, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  role="search"
                >
                  <input
                    autoFocus
                    type="search"
                    name="q"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      fetchSuggestions(e.target.value);
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        if (!searchQuery.trim()) {
                          setSearchOpen(false);
                          setShowSuggestions(false);
                        }
                      }, 200);
                    }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Rechercher…"
                    aria-label="Rechercher un article"
                    autoComplete="off"
                    className="w-full bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm outline-none border border-white/20 placeholder:text-gray-400 focus:border-[#FF0033] transition-colors"
                  />
                </motion.form>
              ) : (
                <motion.button
                  key="search-btn"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Rechercher"
                  className="p-2 hover:text-[#FF0033] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && searchOpen && suggestions.length > 0 && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden z-[60]"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {suggestions.map((s, i) => (
                    <Link
                      key={s.slug}
                      href={`/article/${s.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                        i === selectedIndex
                          ? "bg-gray-100 dark:bg-gray-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      } ${i > 0 ? "border-t border-gray-100 dark:border-gray-800" : ""}`}
                    >
                      {s.imageUrl && (
                        <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                          <Image
                            src={s.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF0033]">
                          {s.category.name}
                        </span>
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                          {s.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/recherche?q=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="block px-4 py-2.5 text-xs font-bold text-center text-[#FF0033] bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-t border-gray-200 dark:border-gray-700"
                  >
                    Voir tous les résultats →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dark mode */}
          <DarkModeToggle />

          {/* Auth */}
          {session ? (
            <div className="relative" ref={userMenuRef}>
              <motion.button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white bg-[#FF0033]"
                aria-label="Menu utilisateur"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {initials}
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className="absolute right-0 top-11 w-48 bg-white text-black shadow-xl border border-gray-100 rounded-lg overflow-hidden z-50"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-xs font-bold truncate">{session.user?.name ?? "Mon compte"}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    {session.user?.role === "ADMIN" && (
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors">
                        Dashboard
                      </Link>
                    )}
                    <Link href="/profil" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">Mon profil</Link>
                    <Link href="/favoris" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">Mes favoris</Link>
                    <button
                      onClick={() => { signOut({ callbackUrl: "/" }); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 font-semibold hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      Se déconnecter
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="hidden md:block text-xs font-black uppercase tracking-widest px-4 py-2 border border-white/30 rounded-full hover:border-[#FF0033] hover:bg-[#FF0033] transition-all duration-300"
              >
                Connexion
              </Link>
            </motion.div>
          )}

          {/* Hamburger */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/5 px-4 pb-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-sm font-semibold uppercase tracking-wide border-b border-white/5 hover:text-[#FF0033] transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            {session ? (
              <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left py-3 text-sm font-semibold text-[#FF0033] uppercase tracking-wide">
                Se déconnecter
              </button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-3 text-sm font-semibold uppercase tracking-wide hover:text-[#FF0033] transition-colors">
                Connexion
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
