import { StructureModel } from '../models/structure.model';
import { StructureStatus }  from '../enums/structure-status.enum';
import { StructurePlanType } from '../enums/structure-plan-type.enum';
import { StructureStats } from '../models/structure-stats.model';
import { BADGE_CLASSES, DOT_CLASSES } from '../../../shared/utils/status.utils';

// ─────────────────────────────────────────────────────────────────
// structure.utils.ts
// Fonctions pures d'affichage — sans injection, réutilisables partout
// Importer uniquement ce dont tu as besoin
// ─────────────────────────────────────────────────────────────────


// ── Statut ────────────────────────────────────────────────────────

export function getStatutLabel(status: StructureStatus): string {
  const map: Record<StructureStatus, string> = {
    [StructureStatus.APPROUVED]: 'Approuvée',
    [StructureStatus.PENDING]:   'En attente',
    [StructureStatus.SUSPENDED]: 'Suspendue',
    [StructureStatus.REJECTED]:  'Rejetée',
  };
  return map[status] ?? status;
}

export function getStatusBadgeClass(status: StructureStatus): string {
  const map: Record<StructureStatus, string> = {
    [StructureStatus.APPROUVED]: BADGE_CLASSES.success,
    [StructureStatus.PENDING]:   BADGE_CLASSES.warning,
    [StructureStatus.SUSPENDED]: BADGE_CLASSES.caution,
    [StructureStatus.REJECTED]:  BADGE_CLASSES.danger,
  };
  return map[status] ?? BADGE_CLASSES.neutral;
}

export function getStatusDotClass(status: StructureStatus): string {
  const map: Record<StructureStatus, string> = {
    [StructureStatus.APPROUVED]: DOT_CLASSES.success,
    [StructureStatus.PENDING]:   DOT_CLASSES.warning,
    [StructureStatus.SUSPENDED]: DOT_CLASSES.caution,
    [StructureStatus.REJECTED]:  DOT_CLASSES.danger,
  };
  return map[status] ?? DOT_CLASSES.neutral;
}

// Règles de transition — quels statuts sont accessibles depuis le statut actuel
export function getAllowedTransitions(current: StructureStatus): StructureStatus[] {
  const rules: Record<StructureStatus, StructureStatus[]> = {
    [StructureStatus.PENDING]:   [StructureStatus.APPROUVED, StructureStatus.REJECTED],
    [StructureStatus.REJECTED]:  [StructureStatus.APPROUVED],
    [StructureStatus.APPROUVED]: [StructureStatus.SUSPENDED],
    [StructureStatus.SUSPENDED]: [StructureStatus.APPROUVED],
  };
  return rules[current] ?? [];
}

export function isTransitionAllowed(current: StructureStatus, next: StructureStatus): boolean {
  return getAllowedTransitions(current).includes(next);
}


// ── Plan ──────────────────────────────────────────────────────────

export function getPlanBadgeClass(plan: StructurePlanType): string {
  const map: Record<StructurePlanType, string> = {
    [StructurePlanType.PREMIUM]:  'bg-secondary-100 text-secondary-700 border-secondary-200',
    [StructurePlanType.FREEMIUM]: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return map[plan] ?? 'bg-gray-100 text-gray-600 border-gray-200';
}

export function getPlanLabel(plan: StructurePlanType): string {
  const map: Record<StructurePlanType, string> = {
    [StructurePlanType.PREMIUM]:  'Premium',
    [StructurePlanType.FREEMIUM]: 'Freemium',
  };
  return map[plan] ?? plan;
}

// Retourne le plan opposé — pour le bouton "Changer"
export function togglePlan(current: StructurePlanType): StructurePlanType {
  return current === StructurePlanType.PREMIUM
    ? StructurePlanType.FREEMIUM
    : StructurePlanType.PREMIUM;
}


// ── Propriétaire ──────────────────────────────────────────────────

export function getOwnerFullName(nom?: string, prenom?: string): string {
  return `${prenom ?? ''} ${nom ?? ''}`.trim() || 'Propriétaire inconnu';
}

export function getInitials(fullName: string): string {
  if (!fullName?.trim()) return '?';
  return fullName
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}


// ── Score de santé ────────────────────────────────────────────────

export function getHealthScore(structure: StructureModel): number {
  if (
    structure.status === StructureStatus.SUSPENDED ||
    structure.status === StructureStatus.REJECTED
  ) return 10;

  const stats: StructureStats = structure.stats ?? { employes: 0, biens: 0, locations: 0 };

  // Formule : taux d'occupation (60%) + présence biens (20%) + taille équipe (20%)
  const occupation  = stats.biens > 0 ? (stats.locations / stats.biens) * 60 : 0;
  const biensScore  = (Math.min(20, stats.biens)     / 20) * 20;
  const equipeScore = (Math.min(10, stats.employes)  / 10) * 20;

  return Math.round(Math.max(10, occupation + biensScore + equipeScore));
}

export function getHealthScoreClass(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-amber-400';
  return 'bg-red-400';
}

export function getHealthTextClass(score: number): string {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-500';
}


// ── Date / Temps ──────────────────────────────────────────────────
// Re-export depuis shared pour éviter la duplication
export { timeAgo, formatDate } from '../../../shared/utils/date.utils';