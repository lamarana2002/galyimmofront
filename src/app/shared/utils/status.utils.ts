// ─────────────────────────────────────────────────────────────────
// shared/utils/status.utils.ts
// Classes Tailwind standardisées pour les badges et dots de statut.
// Les couleurs suivent la palette du projet (primary, secondary, green,
// amber, orange, red). Pas de blue/purple ici pour garder la cohérence.
// ─────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | 'success'       // vert  — disponible, approuvé, actif
  | 'warning'       // amber — en attente, loué
  | 'caution'       // orange — suspendu, en travaux, sous surveillance
  | 'danger'        // rouge — rejeté, erreur
  | 'neutral'       // gris  — vendu, inactif, inconnu
  | 'accent'        // secondary (terracotta) — premium, accent
  | 'info';         // primary — information générale

/** Classes Tailwind pour un badge (bg + text + border). */
export const BADGE_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  caution: 'bg-orange-100 text-orange-700 border-orange-200',
  danger:  'bg-red-100 text-red-700 border-red-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
  accent:  'bg-secondary-100 text-secondary-700 border-secondary-200',
  info:    'bg-primary-100 text-primary-700 border-primary-200',
};

/** Classe Tailwind pour le point de statut (bg couleur unie). */
export const DOT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  caution: 'bg-orange-500',
  danger:  'bg-red-500',
  neutral: 'bg-gray-400',
  accent:  'bg-secondary-500',
  info:    'bg-primary-400',
};

/** Retourne les classes badge pour une variante donnée. */
export function getBadgeClass(variant: BadgeVariant): string {
  return BADGE_CLASSES[variant] ?? BADGE_CLASSES.neutral;
}

/** Retourne la classe dot pour une variante donnée. */
export function getDotClass(variant: BadgeVariant): string {
  return DOT_CLASSES[variant] ?? DOT_CLASSES.neutral;
}
