// ─────────────────────────────────────────────────────────────────
// shared/utils/date.utils.ts
// Fonctions pures de formatage de dates — utilisables partout
// ─────────────────────────────────────────────────────────────────

/**
 * Retourne une durée relative lisible en français.
 * Ex : "il y a 3j", "il y a 2h", "à l'instant"
 */
export function timeAgo(iso: string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60_000);
  const h    = Math.floor(min  / 60);
  const d    = Math.floor(h    / 24);
  if (d > 0)   return `il y a ${d}j`;
  if (h > 0)   return `il y a ${h}h`;
  if (min > 0) return `il y a ${min}min`;
  return "à l'instant";
}

/**
 * Formate une date ISO en format court (jj/mm/aaaa).
 */
export function formatDate(iso: string, locale = 'fr-GN'): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(locale, {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  }).format(new Date(iso));
}

/**
 * Formate une date ISO en format long avec l'heure.
 * Ex : "12 janvier 2024, 14h30"
 */
export function formatDateLong(iso: string, locale = 'fr-GN'): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(locale, {
    day:    '2-digit',
    month:  'long',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}
