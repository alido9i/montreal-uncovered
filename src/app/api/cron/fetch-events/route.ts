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

// Calcule le lundi de la semaine du prochain week-end
function getNextWeekMonday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=dimanche, 4=jeudi
  // On veut le lundi de la semaine courante (le cron roule le jeudi)
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Formate une date pour l'affichage
function formatEventDate(date: Date): string {
  const days = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
  const months = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

// Scrape les événements depuis Tourisme Montréal (page événements)
async function fetchTourismeMontreal(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];

  try {
    const now = new Date();
    // Calculer samedi et dimanche prochains
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + daysUntilSaturday);
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);

    const satStr = formatEventDate(saturday);
    const sunStr = formatEventDate(sunday);

    // Essayer de récupérer la page des événements
    const res = await fetch("https://www.mtl.org/fr/quoi-faire/evenements", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MontrealUncoveredBot/1.0; +https://montreal-uncovered.vercel.app)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const html = await res.text();

      // Extraire les titres d'événements depuis le HTML
      const eventRegex =
        /<h[23][^>]*class="[^"]*card[^"]*"[^>]*>([^<]+)<\/h[23]>/gi;
      let match;
      let count = 0;

      while ((match = eventRegex.exec(html)) !== null && count < 8) {
        const title = match[1].trim();
        if (title.length > 5 && title.length < 200) {
          events.push({
            title,
            date: count < 4 ? satStr : sunStr,
            location: "Montréal",
            type: classifyEvent(title),
            source: "tourisme-montreal",
          });
          count++;
        }
      }
    }
  } catch (e) {
    console.error("Erreur Tourisme Montréal:", e);
  }

  return events;
}

// Scrape MTL Blog événements
async function fetchMtlBlog(): Promise<ScrapedEvent[]> {
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

      // Chercher les titres d'événements dans l'article
      const titleRegex =
        /<h[23][^>]*>([^<]{10,150})<\/h[23]>/gi;
      let match;
      let count = 0;

      const now = new Date();
      const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + daysUntilSaturday);
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);

      while ((match = titleRegex.exec(html)) !== null && count < 6) {
        const title = match[1]
          .trim()
          .replace(/&amp;/g, "&")
          .replace(/&#x27;/g, "'")
          .replace(/&quot;/g, '"');

        // Filtrer les titres qui ne sont clairement pas des événements
        if (
          title.length > 10 &&
          !title.match(
            /cookie|privacy|subscribe|newsletter|related|comment|share/i
          )
        ) {
          events.push({
            title,
            date:
              count % 2 === 0
                ? formatEventDate(saturday)
                : formatEventDate(sunday),
            location: "Montréal",
            type: classifyEvent(title),
            source: "mtl-blog",
          });
          count++;
        }
      }
    }
  } catch (e) {
    console.error("Erreur MTL Blog:", e);
  }

  return events;
}

// Événements de secours si le scraping échoue (basés sur la saison)
function getFallbackEvents(): ScrapedEvent[] {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + daysUntilSaturday);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  const satStr = formatEventDate(saturday);
  const sunStr = formatEventDate(sunday);

  // Événements récurrents basés sur la saison
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
        title: "BIXI — Balades du week-end",
        date: `${satStr} & ${sunStr}`,
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
      date: `${satStr} & ${sunStr}`,
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
        date: `${satStr} & ${sunStr}`,
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

  // Toujours ajouter un événement culture
  seasonal.push({
    title: "Musées montréalais — Expositions en cours",
    date: `${satStr} & ${sunStr}`,
    location: "Divers musées",
    type: "culture",
    source: "fallback",
    href: "https://www.mtl.org/fr/quoi-faire/musees",
  });

  return seasonal.slice(0, 5);
}

export async function GET(request: NextRequest) {
  // Vérifier l'autorisation (Vercel Cron envoie ce header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const weekOf = getNextWeekMonday();

    // Scraper les deux sources en parallèle
    const [tourismEvents, mtlBlogEvents] = await Promise.all([
      fetchTourismeMontreal(),
      fetchMtlBlog(),
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

    // Limiter à 5 événements, bien répartis par type
    if (allEvents.length > 5) {
      // Essayer d'avoir une variété de types
      const byType = new Map<string, ScrapedEvent[]>();
      for (const e of allEvents) {
        const list = byType.get(e.type) || [];
        list.push(e);
        byType.set(e.type, list);
      }

      const selected: ScrapedEvent[] = [];
      const types = [...byType.keys()];
      let typeIdx = 0;
      while (selected.length < 5 && allEvents.length > 0) {
        const type = types[typeIdx % types.length];
        const list = byType.get(type);
        if (list && list.length > 0) {
          selected.push(list.shift()!);
        }
        typeIdx++;
        // Sécurité anti-boucle infinie
        if (typeIdx > 50) break;
      }
      allEvents = selected;
    }

    // Si pas assez d'événements scrapés, utiliser les fallbacks
    if (allEvents.length < 3) {
      console.log("Pas assez d'événements scrapés, utilisation des fallbacks");
      allEvents = getFallbackEvents();
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
      events: allEvents.map((e) => e.title),
    });
  } catch (error) {
    console.error("Erreur cron fetch-events:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des événements" },
      { status: 500 }
    );
  }
}
