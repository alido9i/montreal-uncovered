"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Event {
  title: string;
  date: string;
  location: string;
  type: "festival" | "politique" | "culture" | "gastro" | "sport";
  href?: string;
}

const typeStyles: Record<string, { bg: string; label: string }> = {
  festival: { bg: "bg-purple-500", label: "Festival" },
  politique: { bg: "bg-amber-500", label: "Politique" },
  culture: { bg: "bg-blue-500", label: "Culture" },
  gastro: { bg: "bg-green-500", label: "Gastro" },
  sport: { bg: "bg-orange-500", label: "Sport" },
};

const weekendEvents: Event[] = [
  { title: "Piknic Électronik — Ouverture 2026", date: "Sam. 5 avril", location: "Parc Jean-Drapeau", type: "festival" },
  { title: "Marché Jean-Talon — Saison printemps", date: "Sam. & Dim.", location: "Marché Jean-Talon", type: "gastro" },
  { title: "Expo « Futurs » au MAC", date: "Sam. 5 avril", location: "Musée d'art contemporain", type: "culture" },
  { title: "Manifestation pour le logement", date: "Dim. 6 avril", location: "Place Émilie-Gamelin", type: "politique" },
  { title: "Canadiens vs Bruins", date: "Sam. 5 avril, 19h", location: "Centre Bell", type: "sport" },
];

export default function WeekendAgenda() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">
      <div className="bg-[#FF0033] px-5 py-3">
        <h3 className="text-white font-black text-sm uppercase tracking-widest">
          Ce week-end à Montréal
        </h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {weekendEvents.map((event, i) => {
          const style = typeStyles[event.type];
          return (
            <motion.div
              key={i}
              className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${style.bg}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-snug dark:text-white">{event.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                    <span>{event.date}</span>
                    <span>·</span>
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded ${style.bg}`}>
                  {style.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
