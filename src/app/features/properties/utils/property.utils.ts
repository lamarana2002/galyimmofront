import { PropertyModel } from '../models/property.model';
import { PropertyStatusEnum } from '../enums/property-status.enum';
import { UnitStatutEnum } from '../enums/unit-status.enum';
import { ILocationUnit } from '../models/location-unit.model';
import { BADGE_CLASSES, DOT_CLASSES } from '../../../shared/utils/status.utils';

// ── Statut du bien ─────────────────────────────────────────────────

export function getPropertyStatusLabel(status: PropertyStatusEnum): string {
  const map: Record<PropertyStatusEnum, string> = {
    [PropertyStatusEnum.AVAILABLE]: 'Disponible',
    [PropertyStatusEnum.SOLD]: 'Vendu',
    [PropertyStatusEnum.RENTED]: 'Loué',
    [PropertyStatusEnum.FOR_SALE]: 'En vente',
    [PropertyStatusEnum.FOR_RENT]: 'À louer',
    [PropertyStatusEnum.UNDER_RENOVATION]: 'En travaux',
  };
  return map[status] ?? status;
}

export function getPropertyStatusBadgeClass(status: PropertyStatusEnum): string {
  const map: Record<PropertyStatusEnum, string> = {
    [PropertyStatusEnum.AVAILABLE]:        BADGE_CLASSES.success,
    [PropertyStatusEnum.SOLD]:             BADGE_CLASSES.neutral,
    [PropertyStatusEnum.RENTED]:           BADGE_CLASSES.warning,
    [PropertyStatusEnum.FOR_SALE]:         BADGE_CLASSES.info,
    [PropertyStatusEnum.FOR_RENT]:         BADGE_CLASSES.accent,
    [PropertyStatusEnum.UNDER_RENOVATION]: BADGE_CLASSES.caution,
  };
  return map[status] ?? BADGE_CLASSES.neutral;
}

export function getPropertyStatusDotClass(status: PropertyStatusEnum): string {
  const map: Record<PropertyStatusEnum, string> = {
    [PropertyStatusEnum.AVAILABLE]:        DOT_CLASSES.success,
    [PropertyStatusEnum.SOLD]:             DOT_CLASSES.neutral,
    [PropertyStatusEnum.RENTED]:           DOT_CLASSES.warning,
    [PropertyStatusEnum.FOR_SALE]:         DOT_CLASSES.info,
    [PropertyStatusEnum.FOR_RENT]:         DOT_CLASSES.accent,
    [PropertyStatusEnum.UNDER_RENOVATION]: DOT_CLASSES.caution,
  };
  return map[status] ?? DOT_CLASSES.neutral;
}

// Règles de transition pour les statuts
export function getPropertyAllowedTransitions(current: PropertyStatusEnum): PropertyStatusEnum[] {
  const rules: Record<PropertyStatusEnum, PropertyStatusEnum[]> = {
    [PropertyStatusEnum.AVAILABLE]: [
      PropertyStatusEnum.FOR_SALE,
      PropertyStatusEnum.FOR_RENT,
      PropertyStatusEnum.UNDER_RENOVATION,
    ],
    [PropertyStatusEnum.FOR_SALE]: [
      PropertyStatusEnum.SOLD,
      PropertyStatusEnum.AVAILABLE,
      PropertyStatusEnum.UNDER_RENOVATION,
    ],
    [PropertyStatusEnum.FOR_RENT]: [
      PropertyStatusEnum.RENTED,
      PropertyStatusEnum.AVAILABLE,
      PropertyStatusEnum.UNDER_RENOVATION,
    ],
    [PropertyStatusEnum.RENTED]: [
      PropertyStatusEnum.AVAILABLE,
      PropertyStatusEnum.FOR_RENT,
      PropertyStatusEnum.UNDER_RENOVATION,
    ],
    [PropertyStatusEnum.UNDER_RENOVATION]: [
      PropertyStatusEnum.AVAILABLE,
      PropertyStatusEnum.FOR_SALE,
      PropertyStatusEnum.FOR_RENT,
    ],
    [PropertyStatusEnum.SOLD]: [], // Une fois vendu, plus de transition
  };
  return rules[current] ?? [];
}

export function isPropertyTransitionAllowed(
  current: PropertyStatusEnum,
  next: PropertyStatusEnum,
): boolean {
  return getPropertyAllowedTransitions(current).includes(next);
}

// ── Type de bien ─────────────────────────────────────────────────

export function getPropertyTypeIcon(typeSlug: string): string {
  const map: Record<string, string> = {
    appartement: 'lucideHome',
    villa: 'lucideBuilding2',
    commercial: 'lucideStore',
    terrain: 'lucideMap',
    bureau: 'lucideBuilding',
    entrepot: 'lucideWarehouse',
    immeuble: 'lucideBuilding2',
  };
  return map[typeSlug] ?? 'lucideHome';
}

export function getDocIconColor(ext: string): string {
  const map: Record<string, string> = {
    pdf: 'text-red-600 bg-red-100',
    doc: 'text-blue-600 bg-blue-100',
    docx: 'text-blue-600 bg-blue-100',
    xls: 'text-green-600 bg-green-100',
    xlsx: 'text-green-600 bg-green-100',
    jpg: 'text-purple-600 bg-purple-100',
    png: 'text-purple-600 bg-purple-100',
  };
  return map[ext] ?? 'text-gray-500 bg-gray-100';
}

export function getPropertyTypeLabel(typeSlug: string): string {
  const map: Record<string, string> = {
    appartement: 'Appartement',
    villa: 'Villa',
    commercial: 'Local commercial',
    terrain: 'Terrain',
    bureau: 'Bureau',
    entrepot: 'Entrepôt',
    immeuble: 'Immeuble',
  };
  return map[typeSlug] ?? typeSlug;
}

// ── Adresse ─────────────────────────────────────────────────

export function getPropertyFullAddress(property: PropertyModel): string {
  if (!property.adresse) return 'Adresse non renseignée';

  const parts = [
    property.adresse.repere,
    property.adresse.square_area?.nom,
    property.adresse.square_area?.quartier?.nom,
    property.adresse.square_area?.quartier?.commune?.nom,
    property.adresse.square_area?.quartier?.commune?.ville?.nom,
  ].filter(Boolean);

  return parts.join(', ') || 'Adresse non renseignée';
}

export function getPropertyLocationShort(property: PropertyModel): string {
  if (!property.adresse?.square_area?.quartier?.commune?.ville) {
    return 'Localisation inconnue';
  }

  const ville = property.adresse.square_area.quartier.commune.ville.nom;
  const region = property.adresse.square_area.quartier.commune.ville.region?.nom;

  return region ? `${ville}, ${region}` : ville;
}

// ── Finances ─────────────────────────────────────────────────

export function formatPropertyPrice(price: number | null): string {
  if (!price) return '—';
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getPropertyPricePerM2(property: PropertyModel): number | null {
  if (!property.sale_price || !property.total_surface) return null;
  return Math.round(property.sale_price / property.total_surface);
}

export function formatPropertyPricePerM2(price: number | null): string {
  if (!price) return '—';
  return (
    new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price) + ' / m²'
  );
}

// ── Surface ─────────────────────────────────────────────────

export function formatPropertySurface(surface: number | null): string {
  if (!surface) return '—';
  return (
    new Intl.NumberFormat('fr-GN', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(surface) + ' m²'
  );
}

// ── Statistiques du bien ────────────────────────────────────

export function getPropertyOccupationRate(property: PropertyModel): number {
  if (!property.stats?.units) return 0;
  return Math.round((property.stats.rented / property.stats.units) * 100);
}

export function getPropertyOccupationRateClass(rate: number): string {
  if (rate >= 80) return 'text-green-600';
  if (rate >= 50) return 'text-amber-600';
  if (rate > 0) return 'text-orange-600';
  return 'text-gray-400';
}

export function getPropertyOccupationRateBarClass(rate: number): string {
  if (rate >= 80) return 'bg-green-600';
  if (rate >= 50) return 'bg-amber-600';
  if (rate > 0) return 'bg-orange-600';
  return 'bg-gray-400';
}

export function getPropertyAvailabilityStatus(property: PropertyModel): {
  label: string;
  class: string;
} {
  if (!property.stats) {
    return { label: 'Non renseigné', class: 'text-gray-400' };
  }

  if (property.stats.available === 0) {
    return { label: 'Complet', class: 'text-red-500' };
  }

  if (property.stats.available === property.stats.units) {
    return { label: 'Tout disponible', class: 'text-green-600' };
  }

  return {
    label: `${property.stats.available} disponible(s) sur ${property.stats.units}`,
    class: 'text-amber-600',
  };
}

// ── Unités (LocationUnit) ──────────────────────────────────

export function getUnitStatusLabel(status: UnitStatutEnum): string {
  const map: Record<UnitStatutEnum, string> = {
    [UnitStatutEnum.AVAILABLE]: 'Disponible',
    [UnitStatutEnum.SOLD]: 'Vendu',
    [UnitStatutEnum.RENTED]: 'Loué',
    [UnitStatutEnum.FOR_SALE]: 'En vente',
    [UnitStatutEnum.FOR_RENT]: 'À louer',
    [UnitStatutEnum.UNDER_RENOVATION]: 'En travaux',
  };
  return map[status] ?? status;
}

export function getUnitStatusBadgeClass(status: UnitStatutEnum): string {
  const map: Record<UnitStatutEnum, string> = {
    [UnitStatutEnum.AVAILABLE]:        BADGE_CLASSES.success,
    [UnitStatutEnum.SOLD]:             BADGE_CLASSES.neutral,
    [UnitStatutEnum.RENTED]:           BADGE_CLASSES.warning,
    [UnitStatutEnum.FOR_SALE]:         BADGE_CLASSES.info,
    [UnitStatutEnum.FOR_RENT]:         BADGE_CLASSES.accent,
    [UnitStatutEnum.UNDER_RENOVATION]: BADGE_CLASSES.caution,
  };
  return map[status] ?? BADGE_CLASSES.neutral;
}

export function getUnitStatusDotClass(status: UnitStatutEnum): string {
  const map: Record<UnitStatutEnum, string> = {
    [UnitStatutEnum.AVAILABLE]:        DOT_CLASSES.success,
    [UnitStatutEnum.SOLD]:             DOT_CLASSES.neutral,
    [UnitStatutEnum.RENTED]:           DOT_CLASSES.warning,
    [UnitStatutEnum.FOR_SALE]:         DOT_CLASSES.info,
    [UnitStatutEnum.FOR_RENT]:         DOT_CLASSES.accent,
    [UnitStatutEnum.UNDER_RENOVATION]: DOT_CLASSES.caution,
  };
  return map[status] ?? DOT_CLASSES.neutral;
}

export function getUnitFullName(unit: ILocationUnit): string {
  if (unit.is_primary) return 'Unité principale';
  return unit.unit_number ? `Unité ${unit.unit_number}` : `Unité ${unit.unit_code}`;
}

export function getUnitLocation(unit: ILocationUnit): string {
  const parts = [];
  if (unit.entrance) parts.push(`Entrée ${unit.entrance}`);
  if (unit.floor !== null) {
    const floorLabel = unit.floor === 0 ? 'RDC' : `Étage ${unit.floor}`;
    parts.push(floorLabel);
  }
  if (unit.lot_number) parts.push(`Lot ${unit.lot_number}`);
  return parts.join(' · ') || 'Emplacement non spécifié';
}

export function formatUnitRent(unit: ILocationUnit): string {
  if (!unit.rent_amount) return '—';
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
  }).format(unit.rent_amount);
}

export function getUnitBedroomsLabel(unit: ILocationUnit): string {
  const parts = [];
  if (unit.rooms) parts.push(`${unit.rooms} pièces`);
  if (unit.bedrooms) parts.push(`${unit.bedrooms} chambre(s)`);
  if (unit.bathrooms) parts.push(`${unit.bathrooms} sdb`);
  if (unit.toilets) parts.push(`${unit.toilets} wc`);
  return parts.join(' · ') || '—';
}

export function isUnitFurnished(unit: ILocationUnit): boolean {
  return unit.is_furnished;
}

export function getUnitFurnishedLabel(unit: ILocationUnit): string {
  return unit.is_furnished ? 'Meublé' : 'Non meublé';
}

export function getUnitMonthlyCharges(unit: ILocationUnit): string {
  if (!unit.monthly_charges) return '—';
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
  }).format(unit.monthly_charges);
}

// ── UI Helpers ─────────────────────────────────────────────

export function getPropertyInitials(name: string): string {
  if (!name?.trim()) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Couleur de fond aléatoire mais stable basée sur l'ID
export function getPropertyAvatarColor(id: number): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  return colors[id % colors.length];
}

// Pour les biens avec unités (has_units = true)
export function hasPropertyUnits(property: PropertyModel): boolean {
  return property.has_units;
}

export function getPropertyUnitsSummary(property: PropertyModel): string {
  if (!property.stats) return '—';
  return `${property.stats.rented}/${property.stats.units} loués`;
}

// ── Date / Temps ───────────────────────────────────────────
// Re-export depuis shared pour éviter la duplication
export { timeAgo as propertyTimeAgo, formatDate as formatPropertyDate } from '../../../shared/utils/date.utils';
