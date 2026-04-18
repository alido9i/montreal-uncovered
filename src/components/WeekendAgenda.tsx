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

const DAYS = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
const MONTHS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

function fmt(d: Date) {
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Retourne le lundi de la semaine courante */
function getCurrentMonday(): Date {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Sous-titre dynamique : "Lun. 14 — Dim. 20 avr." */
function getWeekRange(): string {
  const monday = getCurrentMonday();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${fmt(monday)} — ${fmt(sunday)}`;
}

/** Événements par défaut couvrant lundi à dimanche */
function getDefaultEvents(): Event[] {
  const monday = getCurrentMonday();
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }

  return [
    { id: "d1", title: "Marché Jean-Talon — Saison ouverte", date: `${fmt(dates[5])} & ${fmt(dates[6])}`, location: "Marché Jean-Talon", type: "gastro" },
    { id: "d2", title: "Expositions en cours — Musées de Montréal", date: `${fmt(dates[0])} au ${fmt(dates[6])}`, location: "Divers musées", type: "culture" },
    { id: "d3", title: "Balade sur le Mont-Royal", date: fmt(dates[5]), location: "Parc du Mont-Royal", type: "sport" },
    { id: "d4", title: "Quartier des spectacles — Activités gratuites", date: `${fmt(dates[4])} au ${fmt(dates[6])}`, location: "Quartier des spectacles", type: "festival" },
    { id: "d5", title: "5 à 7 culturel du Vieux-Port", date: fmt(dates[3]), location: "Vieux-Port de Montréal", type: "culture" },
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
          Cette semaine à Montréal
        </h3>
        <p className="text-white/70 text-[10px] font-medium tracking-wide mt-0.5">
          {getWeekRange()}
        </p>
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
          Mis à jour chaque lundi
        </div>
      )}
    </div>
  );
}
