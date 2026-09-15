"use client";

import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";

export default function DarkModeToggle() {
  const { toggle } = useTheme();

  // Les deux icônes sont rendues et sélectionnées en CSS via la classe .dark :
  // le markup est identique côté serveur et client, donc pas de mismatch
  // d'hydratation ni d'icône erronée pendant le premier rendu.
  return (
    <motion.button
      onClick={toggle}
      className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
      aria-label="Basculer entre le mode jour et le mode nuit"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        className="hidden dark:block"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        className="block dark:hidden"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </motion.button>
  );
}
