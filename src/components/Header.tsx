"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import DarkModeToggle from "./DarkModeToggle";

const navLinks = [
  { label: "Montréal Local", href: "/montreal-local" },
  { label: "Culture", href: "/culture" },
  { label: "Gastronomie", href: "/gastronomie" },
  { label: "Société", href: "/societe" },
  { label: "Style de vie", href: "/style-de-vie" },
  { label: "Ailleurs", href: "/ailleurs" },
];

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
          <AnimatePresence>
            {searchOpen ? (
              <motion.input
                key="search"
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { setSearchOpen(false); setSearchQuery(""); }}
                placeholder="Rechercher…"
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm w-52 outline-none border border-white/20 placeholder:text-gray-400 focus:border-[#FF0033] transition-colors"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 208, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
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
