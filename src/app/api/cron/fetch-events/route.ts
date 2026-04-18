import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Types d'événements supportés
const EVENT_TYPES = ["festival", "culture", "gastro", "sport", "politique"] as const;

interface ScrapedEvent {
  title: string;
  date: string;
  location: string;
  type: string;
  href?: string;
  source: string;
}

// Classifie le type d'événement en fonction du titre et de la description
function classifyEvent(title: string, description: string = ""): string {
  const text = `${title} ${description}`.toLowerCase();

  if (text.match(/festival|piknic|igloofest|osheaga|francos|musique|concert|spectacle|dj/)) return "festival";
  if (text.match(/manif|protest|logement|marche pour|grève|politique|vote|élection/)) return "politique";
  if (text.match(/musée|expo|galerie|théâtre|cinéma|art|murale|danse|cirque|livre/)) return "culture";
  if (text.match(/marché|bouffe|food|resto|brunch|bière|vin|cuisine|poutine|dégustation/)) return "gastro";
  if (text.match(/hockey|canadiens|cf montréal|marathon|vélo|sport|match|course|alouettes/)) return "sport";

  return "culture"; // défaut
}

const DAYS = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
const MONTHS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

function formatEventDate(date: Date): string {
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
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

/** Retourne les 7 jours de la semaine (lun-dim) */
function getWeekDates(monday: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

// Scrape les événements depuis Tourisme Montréal
async function fetchTourismeMontreal(weekDates: Date[]): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];

  try {
    const res = await fetch("https://www.mtl.org/fr/quoi-faire/evenements", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MontrealUncoveredBot/1.0; +https://montreal-uncovered.vercel.app)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const html = await res.text();
      const eventRegex =
        /<h[23][^>]*class="[^"]*card[^"]*"[^>]*>([^<]+)<\/h[23]>/gi;
      let match;
      let count = 0;

      while ((match = eventRegex.exec(html)) !== null && count < 10) {
        const title = match[1].trim();
        if (title.length > 5 && title.length < 200) {
          // Distribuer les événements sur toute la semaine
          const dayIndex = count % 7;
          events.push({
            title,
            date: formatEventDate(weekDates[dayIndex]),
            location: "Montréal",
            type: classifyEvent(title),
            source: "tourisme-montreal",
          });
          count++;
        }
      }
    }
  } catch (e) {
    console.error("[CRON] Erreur Tourisme Montréal:", e);
  }

  return events;
}

// Scrape MTL Blog événements
async function fetchMtlBlog(weekDates: Date[]): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];

  try {
    const res = await fetch(
      "https://www.mtlblog.com/things-to-do-in-montreal-this-weekend",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; MontrealUncoveredBot/1.0; +https://montreal-uncovered.vercel.app)",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (res.ok) {
      const html = await res.text();
      const titleRegex = /<h[23][^>]*>([^<]{10,150})<\/h[23]>/gi;
      let match;
      let count = 0;

      while ((match = titleRegex.exec(html)) !== null && count < 8) {
        const title = match[1]
          .trim()
          .replace(/&amp;/g, "&")
          .replace(/&#x27;/g, "'")
          .replace(/&quot;/g, '"');

        if (
          title.length > 10 &&
          !title.match(
            /cookie|privacy|subscribe|newsletter|related|comment|share/i
          )
        ) {
          const dayIndex = count % 7;
          events.push({
            title,
            date: formatEventDate(weekDates[dayIndex]),
            location: "Montréal",
            type: classifyEvent(title),
            source: "mtl-blog",
          });
          count++;
        }
      }
    }
  } catch (e) {
    console.error("[CRON] Erreur MTL Blog:", e);
  }

  return events;
}

// Événements de secours si le scraping échoue (basés sur la saison)
function getFallbackEvents(weekDates: Date[]): ScrapedEvent[] {
  const month = weekDates[0].getMonth(); // 0-11
  const monStr = formatEventDate(weekDates[0]);
  const friStr = formatEventDate(weekDates[4]);
  const satStr = formatEventDate(weekDates[5]);
  const sunStr = formatEventDate(weekDates[6]);

  const seasonal: ScrapedEvent[] = [];

  // Toute l'année
  seasonal.push({
    title: "Marché Jean-Talon",
    date: `${satStr} & ${sunStr}`,
    location: "Marché Jean-Talon",
    type: "gastro",
    source: "fallback",
    href: "https://www.marchespublics-mtl.com/marches/jean-talon/",
  });

  seasonal.push({
    title: "Musées montréalais — Expositions en cours",
    date: `${monStr} au ${sunStr}`,
    location: "Divers musées",
    type: "culture",
    source: "fallback",
    href: "https://www.mtl.org/fr/quoi-faire/musees",
  });

  if (month >= 4 && month <= 9) {
    // Mai à octobre — été
    seasonal.push(
      {
        title: "Piknic Électronik",
        date: sunStr,
        location: "Parc Jean-Drapeau",
        type: "festival",
        source: "fallback",
      },
      {
        title: "BIXI — Balades de la semaine",
        date: `${monStr} au ${sunStr}`,
        location: "Partout à Montréal",
        type: "sport",
        source: "fallback",
      }
    );
  }

  if (month >= 5 && month <= 6) {
    // Juin-juillet — saison des festivals
    seasonal.push({
      title: "Saison des festivals — Quartier des spectacles",
      date: `${friStr} au ${sunStr}`,
      location: "Quartier des spectacles",
      type: "festival",
      source: "fallback",
    });
  }

  if (month >= 10 || month <= 2) {
    // Novembre à mars — hiver
    seasonal.push(
      {
        title: "Patinage au Vieux-Port",
        date: `${satStr} & ${sunStr}`,
        location: "Vieux-Port de Montréal",
        type: "sport",
        source: "fallback",
      },
      {
        title: "RÉSO — Escapade souterraine",
        date: `${monStr} au ${sunStr}`,
        location: "Ville souterraine",
        type: "culture",
        source: "fallback",
      }
    );
  }

  if (month === 0) {
    // Janvier — Igloofest
    seasonal.push({
      title: "Igloofest 2026",
      date: satStr,
      location: "Quai Jacques-Cartier",
      type: "festival",
      source: "fallback",
    });
  }

  // 5 à 7 en semaine
  seasonal.push({
    title: "5 à 7 culturel du Vieux-Port",
    date: formatEventDate(weekDates[3]),
    location: "Vieux-Port de Montréal",
    type: "culture",
    source: "fallback",
  });

  return seasonal.slice(0, 7);
}

export async function GET(request: NextRequest) {
  // Vérifier l'autorisation (Vercel Cron envoie ce header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const weekOf = getCurrentMonday();
    const weekDates = getWeekDates(weekOf);

    // Scraper les deux sources en parallèle
    const [tourismEvents, mtlBlogEvents] = await Promise.all([
      fetchTourismeMontreal(weekDates),
      fetchMtlBlog(weekDates),
    ]);

    // Combiner et dédupliquer
    let allEvents = [...tourismEvents, ...mtlBlogEvents];

    // Dédupliquer par titre similaire
    const seen = new Set<string>();
    allEvents = allEvents.filter((e) => {
      const key = e.title.toLowerCase().substring(0, 30);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Limiter à 7 événements, bien répartis par type
    if (allEvents.length > 7) {
      const byType = new Map<string, ScrapedEvent[]>();
      for (const e of allEvents) {
        const list = byType.get(e.type) || [];
        list.push(e);
        byType.set(e.type, list);
      }

      const selected: ScrapedEvent[] = [];
      const types = [...byType.keys()];
      let typeIdx = 0;
      while (selected.length < 7 && allEvents.length > 0) {
        const type = types[typeIdx % types.length];
        const list = byType.get(type);
        if (list && list.length > 0) {
          selected.push(list.shift()!);
        }
        typeIdx++;
        if (typeIdx > 50) break;
      }
      allEvents = selected;
    }

    // Si pas assez d'événements scrapés, utiliser les fallbacks
    if (allEvents.length < 3) {
      console.log("[CRON] Pas assez d'événements scrapés, utilisation des fallbacks");
      allEvents = getFallbackEvents(weekDates);
    }

    // Supprimer les anciens événements de cette semaine
    await db.weekendEvent.deleteMany({
      where: { weekOf },
    });

    // Insérer les nouveaux
    for (const event of allEvents) {
      await db.weekendEvent.create({
        data: {
          title: event.title,
          date: event.date,
          location: event.location,
          type: event.type,
          href: event.href || null,
          source: event.source,
          weekOf,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: allEvents.length,
      weekOf: weekOf.toISOString(),
      events: allEvents.map((e) => `${e.date} — ${e.title}`),
    });
  } catch (error) {
    console.error("[CRON] Erreur fetch-events:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des événements" },
      { status: 500 }
    );
  }
}
