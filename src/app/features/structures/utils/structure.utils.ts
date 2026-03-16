import { StructureModel } from '../models/structure.model';
import { StructureStatus }  from '../enums/structure-status.enum';
import { StructurePlanType } from '../enums/structure-plan-type.enum';
import { StructureStats } from '../models/structure-stats.model';

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
    [StructureStatus.APPROUVED]: 'bg-green-100 text-green-700 border-green-200',
    [StructureStatus.PENDING]:   'bg-amber-100 text-amber-700 border-amber-200',
    [StructureStatus.SUSPENDED]: 'bg-orange-100 text-orange-700 border-orange-200',
    [StructureStatus.REJECTED]:  'bg-red-100 text-red-700 border-red-200',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

export function getStatusDotClass(status: StructureStatus): string {
  const map: Record<StructureStatus, string> = {
    [StructureStatus.APPROUVED]: 'bg-green-500',
    [StructureStatus.PENDING]:   'bg-amber-500',
    [StructureStatus.SUSPENDED]: 'bg-orange-500',
    [StructureStatus.REJECTED]:  'bg-red-500',
  };
  return map[status] ?? 'bg-gray-400';
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

export function formatDate(iso: string, locale = 'fr-GN'): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(locale, {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  }).format(new Date(iso));
}