/**
 * Calcule le temps de lecture estimé en minutes.
 * Vitesse moyenne de lecture : 220 mots/min en français.
 * Nettoie le markdown simplifié pour ne compter que les mots réels.
 */
export function calculateReadingTime(content: string): number {
  const cleaned = content
    // Retire les syntaxes markdown qui ne sont pas des mots lus
    .replace(/^#{1,6}\s+/gm, "") // titres
    .replace(/\*\*(.+?)\*\*/g, "$1") // gras
    .replace(/\*(.+?)\*/g, "$1") // italique
    .replace(/`([^`]+)`/g, "$1") // code inline
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // liens → garde le texte
    .replace(/^[-*+]\s+/gm, "") // puces
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return 1;

  const words = cleaned.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
