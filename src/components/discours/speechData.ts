/**
 * Données du « discours augmenté » — Mark Carney, Ottawa, 27 mars 2025.
 *
 * Les timecodes viennent d'une transcription mot-à-mot du clip source
 * (public/videos/carney-2025-03-27.mp4, 66,0 s) : chaque incrustation est calée
 * sur le mot qu'elle illustre, jamais sur une grille arbitraire. Si on remplace
 * la vidéo, il faut refaire les timecodes.
 *
 * Règle éditoriale : aucune statistique sans `sourceId`, et toute source est
 * consultable par le lecteur (bouton « source » sur la carte + liste en bas de
 * page). C'est ce qui distingue une infographie d'une décoration.
 */

export const VIDEO_SRC = "/videos/carney-2025-03-27.mp4";
export const POSTER_SRC = "/images/discours/carney-poster.jpg";
export const DURATION = 66.0;

/* ------------------------------------------------------------------ sources */

export interface Source {
  label: string;
  publisher: string;
  url: string;
}

export const SOURCES: Record<string, Source> = {
  statcan: {
    label: "Le commerce international de marchandises du Canada, décembre 2024",
    publisher: "Statistique Canada",
    url: "https://www150.statcan.gc.ca/n1/daily-quotidien/250205/dq250205a-eng.htm",
  },
  cvma: {
    label: "Industry Facts",
    publisher: "Association canadienne des constructeurs de véhicules",
    url: "http://www.cvma.ca/industry/facts/",
  },
  pmTarifs: {
    label:
      "Le Canada annonce de nouvelles contre-mesures en réponse aux tarifs des États-Unis",
    publisher: "Cabinet du premier ministre du Canada",
    url: "https://www.pm.gc.ca/en/news/news-releases/2025/04/03/canada-announces-new-countermeasures-response-tariffs-from-united-states",
  },
  finAutos: {
    label:
      "Entrée en vigueur des contre-mesures visant les véhicules importés des États-Unis",
    publisher: "Ministère des Finances du Canada",
    url: "https://www.canada.ca/en/department-finance/news/2025/04/canada-announces-entry-into-force-of-countermeasures-against-auto-imports-from-the-united-states.html",
  },
  lesage: {
    label: "Élection générale québécoise de 1962",
    publisher: "Wikipédia",
    url: "https://fr.wikipedia.org/wiki/%C3%89lections_g%C3%A9n%C3%A9rales_qu%C3%A9b%C3%A9coises_de_1962",
  },
};

/* ----------------------------------------------------------------- chapitres */

export interface Chapter {
  id: string;
  start: number;
  end: number;
  title: string;
}

export const CHAPTERS: Chapter[] = [
  { id: "bascule", start: 0, end: 5.32, title: "Le basculement" },
  { id: "apres-guerre", start: 5.32, end: 22.44, title: "Le système d'après-guerre" },
  { id: "termine", start: 22.44, end: 30.25, title: "« C'est terminé »" },
  { id: "80-ans", start: 30.25, end: 43.44, title: "80 ans de leadership américain" },
  { id: "realite", start: 43.44, end: 52.58, title: "Une tragédie, et la nouvelle réalité" },
  { id: "riposte", start: 52.58, end: 63.48, title: "Riposter" },
  { id: "maitres", start: 63.48, end: DURATION, title: "« Maîtres chez nous »" },
];

/* ---------------------------------------------------------------- sous-titres */

export interface Caption {
  start: number;
  end: number;
  fr: string;
  en: string;
}

export const CAPTIONS: Caption[] = [
  {
    start: 0,
    end: 5.32,
    fr: "L'économie mondiale est fondamentalement différente aujourd'hui de ce qu'elle était hier.",
    en: "The global economy is fundamentally different today than it was yesterday.",
  },
  {
    start: 5.32,
    end: 11.04,
    fr: "Le système commercial mondial ancré sur les États-Unis, sur lequel le Canada s'appuie",
    en: "The system of global trade anchored on the United States that Canada has relied",
  },
  {
    start: 11.04,
    end: 18.04,
    fr: "depuis la fin de la Seconde Guerre mondiale — un système qui, sans être parfait,",
    en: "on since the end of the Second World War, a system that, while not perfect, has",
  },
  {
    start: 18.04,
    end: 24.36,
    fr: "a nourri la prospérité de notre pays pendant des décennies — est terminé. Notre ancienne",
    en: "helped to deliver prosperity for our country for decades is over. Our old",
  },
  {
    start: 24.36,
    end: 30.54,
    fr: "relation d'intégration toujours plus poussée avec les États-Unis est terminée. Les 80 ans",
    en: "relationship of steadily deepening integration with the United States is over. The 80-year",
  },
  {
    start: 30.54,
    end: 35.3,
    fr: "durant lesquels les États-Unis ont endossé le rôle de chef de file de l'économie mondiale,",
    en: "period when the United States embraced the mantle of global economic leadership, when",
  },
  {
    start: 35.3,
    end: 41.14,
    fr: "forgé des alliances fondées sur la confiance et le respect mutuel et défendu l'échange libre",
    en: "it forged alliances rooted in trust and mutual respect and championed the free and open exchange",
  },
  {
    start: 41.14,
    end: 52.58,
    fr: "et ouvert des biens et des services : c'est terminé. C'est une tragédie, mais c'est aussi la nouvelle réalité.",
    en: "of goods and services is over. While this is a tragedy, it is also the new reality.",
  },
  {
    start: 52.58,
    end: 63.48,
    fr: "Nous devons répondre avec détermination et avec force. Nous sommes un pays libre, souverain et ambitieux.",
    en: "We must respond with both purpose and force. We are a free, sovereign, and ambitious country.",
  },
  {
    start: 63.48,
    end: DURATION,
    fr: "Nous sommes maîtres chez nous.",
    en: "We are masters in our own home.",
  },
];

/* -------------------------------------------------------------- incrustations */

/** Zone d'affichage. Sur mobile les cartes passent sous la vidéo (cf. Overlays). */
export type Slot = "right" | "bottomLeft";

interface CueBase {
  id: string;
  start: number;
  end: number;
  slot: Slot;
}

export type Cue =
  | (CueBase & {
      kind: "lowerThird";
      name: string;
      role: string;
      place: string;
    })
  | (CueBase & {
      kind: "stat";
      /** Valeur numérique — animée en compteur. */
      value: number;
      decimals?: number;
      prefix?: string;
      suffix?: string;
      label: string;
      note: string;
      sourceId: keyof typeof SOURCES;
    })
  | (CueBase & {
      kind: "stamp";
      text: string;
      /** « 2 / 3 » : Carney prononce trois fois « is over ». */
      index: number;
      total: number;
    })
  | (CueBase & {
      kind: "years";
      from: number;
      to: number;
      label: string;
      note: string;
    })
  | (CueBase & {
      kind: "photo";
      src: string;
      alt: string;
      caption: string;
      credit: string;
      license: string;
      pageUrl: string;
    });

/**
 * 11 incrustations sur 66 secondes — volontairement peu. Une carte à la fois,
 * ~5 s à l'écran, jamais deux statistiques en concurrence.
 */
export const CUES: Cue[] = [
  {
    id: "id",
    kind: "lowerThird",
    slot: "bottomLeft",
    start: 0.8,
    end: 6.2,
    name: "Mark Carney",
    role: "Premier ministre du Canada",
    place: "Ottawa · 27 mars 2025",
  },
  {
    id: "bretton-woods",
    kind: "photo",
    slot: "right",
    start: 11.2,
    end: 17.8,
    src: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Morgenthau_Bretton_Woods_opening_1944.jpg",
    alt: "Ouverture de la conférence de Bretton Woods en juillet 1944.",
    caption: "Bretton Woods, juillet 1944 — l'ordre économique dont Carney annonce la fin.",
    credit: "Wikimedia Commons",
    license: "Domaine public",
    pageUrl:
      "https://commons.wikimedia.org/wiki/File:Morgenthau_Bretton_Woods_opening_1944.jpg",
  },
  {
    id: "over-1",
    kind: "stamp",
    slot: "bottomLeft",
    start: 22.44,
    end: 26.4,
    text: "C'est terminé",
    index: 1,
    total: 3,
  },
  {
    id: "exports",
    kind: "stat",
    slot: "right",
    start: 24.6,
    end: 30.2,
    value: 75.9,
    decimals: 1,
    suffix: " %",
    label: "des exportations canadiennes partent aux États-Unis",
    note: "2024 — en baisse de 1,0 point sur un an",
    sourceId: "statcan",
  },
  {
    id: "over-2",
    kind: "stamp",
    slot: "bottomLeft",
    start: 28.5,
    end: 32.2,
    text: "C'est terminé",
    index: 2,
    total: 3,
  },
  {
    id: "80-ans",
    kind: "years",
    slot: "right",
    start: 30.8,
    end: 37.4,
    from: 1945,
    to: 2025,
    label: "80 ans",
    note: "De la fin de la Seconde Guerre mondiale au discours de ce jour.",
  },
  {
    id: "imports",
    kind: "stat",
    slot: "right",
    start: 37.6,
    end: 43.2,
    value: 62.2,
    decimals: 1,
    suffix: " %",
    label: "des importations canadiennes viennent des États-Unis",
    note: "2024 — plus de 1 000 G$ d'échanges dans les deux sens",
    sourceId: "statcan",
  },
  {
    id: "over-3",
    kind: "stamp",
    slot: "bottomLeft",
    start: 43.44,
    end: 47.4,
    text: "C'est terminé",
    index: 3,
    total: 3,
  },
  {
    id: "pont",
    kind: "photo",
    slot: "right",
    start: 46.6,
    end: 52.4,
    src: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Ambassador_Bridge_Between_Detroit%2C_Michigan_and_Windsor%2C_Ontario_%2814180773736%29.jpg",
    alt: "Le pont Ambassador reliant Detroit (Michigan) à Windsor (Ontario).",
    caption:
      "Pont Ambassador, Windsor–Detroit : la « nouvelle réalité » passe d'abord par là.",
    credit: "Ken Lund, Wikimedia Commons",
    license: "CC BY-SA 2.0",
    pageUrl:
      "https://commons.wikimedia.org/wiki/File:Ambassador_Bridge_Between_Detroit,_Michigan_and_Windsor,_Ontario_(14180773736).jpg",
  },
  {
    id: "tarif-us",
    kind: "stat",
    slot: "right",
    start: 53.2,
    end: 58.6,
    value: 25,
    suffix: " %",
    label: "de tarifs américains sur les automobiles canadiennes",
    note: "Annoncé la veille du discours, en vigueur le 3 avril 2025",
    sourceId: "pmTarifs",
  },
  {
    id: "emplois",
    kind: "stat",
    slot: "right",
    start: 58.8,
    end: 63.4,
    value: 105600,
    label: "emplois directs dans la fabrication automobile au Canada",
    note: "Plus de 603 500 emplois directs et indirects · 1,294 M de véhicules produits en 2024",
    sourceId: "cvma",
  },
];

/* ------------------------------------------------------------------ carte finale */

/** Affichée sur les 2 dernières secondes puis figée quand la vidéo se termine. */
export const END_CARD = {
  start: 63.48,
  quoteFr: "Nous sommes maîtres chez nous.",
  quoteEn: "We are masters in our own home.",
  kicker: "L'écho québécois",
  body:
    "En anglais comme en français, Carney reprend mot pour mot le slogan de Jean Lesage à la campagne de 1962 — celui de la nationalisation de l'électricité et de la Révolution tranquille.",
  photo: {
    src: "https://upload.wikimedia.org/wikipedia/commons/4/45/Jean_Lesage.jpg",
    alt: "Portrait de Jean Lesage, premier ministre du Québec de 1960 à 1966.",
    credit: "Wikimedia Commons",
    license: "Domaine public",
    pageUrl: "https://commons.wikimedia.org/wiki/File:Jean_Lesage.jpg",
  },
  sourceId: "lesage" as const,
};
