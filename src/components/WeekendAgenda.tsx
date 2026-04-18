"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  type: string;
  href?: string | null;
}

const typeStyles: Record<string, { bg: string; label: string }> = {
  festival: { bg: "bg-purple-500", label: "Festival" },
  politique: { bg: "bg-amber-500", label: "Politique" },
  culture: { bg: "bg-blue-500", label: "Culture" },
  gastro: { bg: "bg-green-500", label: "Gastro" },
  sport: { bg: "bg-orange-500", label: "Sport" },
};

// Événements par défaut au cas où la DB est vide
function getDefaultEvents(): Event[] {
  const now = new Date();
  const daysUntilSat = (6 - now.getDay() + 7) % 7 || 7;
  const sat = new Date(now);
  sat.setDate(now.getDate() + daysUntilSat);
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);

  const fmt = (d: Date) => {
    const days = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
    const months = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  };

  return [
    { id: "d1", title: "Marché Jean-Talon — Saison ouverte", date: `${fmt(sat)} & ${fmt(sun)}`, location: "Marché Jean-Talon", type: "gastro" },
    { id: "d2", title: "Expositions en cours — Musées de Montréal", date: `${fmt(sat)} & ${fmt(sun)}`, location: "Divers musées", type: "culture" },
    { id: "d3", title: "Balade sur le Mont-Royal", date: fmt(sat), location: "Parc du Mont-Royal", type: "sport" },
    { id: "d4", title: "Quartier des spectacles — Activités gratuites", date: fmt(sun), location: "Quartier des spectacles", type: "festival" },
  ];
}

export default function WeekendAgenda() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data);
        } else {
          setEvents(getDefaultEvents());
        }
      })
      .catch(() => {
        setEvents(getDefaultEvents());
      })
      .finally(() => setLoading(false));
  }, []);

  const displayEvents = loading ? getDefaultEvents() : events;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">
      <div className="bg-[#FF0033] px-5 py-3">
        <h3 className="text-white font-black text-sm uppercase tracking-widest">
          Ce week-end à Montréal
        </h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {displayEvents.map((event, i) => {
          const style = typeStyles[event.type] || typeStyles.culture;
          const Wrapper = event.href ? "a" : "div";
          const linkProps = event.href
            ? { href: event.href, target: "_blank" as const, rel: "noopener noreferrer" }
            : {};

          return (
            <motion.div
              key={event.id || i}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.15 }}
            >
              <Wrapper className="px-5 py-3 block cursor-pointer" {...linkProps}>
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
              </Wrapper>
            </motion.div>
          );
        })}
      </div>
      {!loading && (
        <div className="px-5 py-2 text-[10px] text-gray-300 dark:text-gray-600 text-right">
          Mis à jour automatiquement chaque semaine
        </div>
      )}
    </div>
  );
}
