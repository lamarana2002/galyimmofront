import { PropertyModel } from '../models/property.model';
import { ProperttyStatusEnum } from '../enums/property-status.enum';
import { PropertyStats } from '../models/property-stats.model';
import { UnitStatutEnum } from '../enums/unit-status.enum';
import { ILocationUnit } from '../models/location-unit.model';

// ── Statut du bien ─────────────────────────────────────────────────

export function getPropertyStatusLabel(status: ProperttyStatusEnum): string {
  const map: Record<ProperttyStatusEnum, string> = {
    [ProperttyStatusEnum.AVAILABLE]: 'Disponible',
    [ProperttyStatusEnum.SOLD]: 'Vendu',
    [ProperttyStatusEnum.RENTED]: 'Loué',
    [ProperttyStatusEnum.FOR_SALE]: 'En vente',
    [ProperttyStatusEnum.FOR_RENT]: 'À louer',
    [ProperttyStatusEnum.UNDER_RENOVATION]: 'En travaux',
  };
  return map[status] ?? status;
}

export function getPropertyStatusBadgeClass(status: ProperttyStatusEnum): string {
  const map: Record<ProperttyStatusEnum, string> = {
    [ProperttyStatusEnum.AVAILABLE]: 'bg-green-100 text-green-700 border-green-200',
    [ProperttyStatusEnum.SOLD]: 'bg-gray-100 text-gray-700 border-gray-200',
    [ProperttyStatusEnum.RENTED]: 'bg-amber-100 text-amber-700 border-amber-200',
    [ProperttyStatusEnum.FOR_SALE]: 'bg-blue-100 text-blue-700 border-blue-200',
    [ProperttyStatusEnum.FOR_RENT]: 'bg-purple-100 text-purple-700 border-purple-200',
    [ProperttyStatusEnum.UNDER_RENOVATION]: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}


export function getPropertyStatusDotClass(status: ProperttyStatusEnum): string {
  const map: Record<ProperttyStatusEnum, string> = {
    [ProperttyStatusEnum.AVAILABLE]: 'bg-green-500',
    [ProperttyStatusEnum.SOLD]: 'bg-gray-500',
    [ProperttyStatusEnum.RENTED]: 'bg-amber-500',
    [ProperttyStatusEnum.FOR_SALE]: 'bg-blue-500',
    [ProperttyStatusEnum.FOR_RENT]: 'bg-purple-500',
    [ProperttyStatusEnum.UNDER_RENOVATION]: 'bg-orange-500',
  };
  return map[status] ?? 'bg-gray-400';
}

// Règles de transition pour les statuts
export function getPropertyAllowedTransitions(current: ProperttyStatusEnum): ProperttyStatusEnum[] {
  const rules: Record<ProperttyStatusEnum, ProperttyStatusEnum[]> = {
    [ProperttyStatusEnum.AVAILABLE]: [
      ProperttyStatusEnum.FOR_SALE,
      ProperttyStatusEnum.FOR_RENT,
      ProperttyStatusEnum.UNDER_RENOVATION,
    ],
    [ProperttyStatusEnum.FOR_SALE]: [
      ProperttyStatusEnum.SOLD,
      ProperttyStatusEnum.AVAILABLE,
      ProperttyStatusEnum.UNDER_RENOVATION,
    ],
    [ProperttyStatusEnum.FOR_RENT]: [
      ProperttyStatusEnum.RENTED,
      ProperttyStatusEnum.AVAILABLE,
      ProperttyStatusEnum.UNDER_RENOVATION,
    ],
    [ProperttyStatusEnum.RENTED]: [
      ProperttyStatusEnum.AVAILABLE,
      ProperttyStatusEnum.FOR_RENT,
      ProperttyStatusEnum.UNDER_RENOVATION,
    ],
    [ProperttyStatusEnum.UNDER_RENOVATION]: [
      ProperttyStatusEnum.AVAILABLE,
      ProperttyStatusEnum.FOR_SALE,
      ProperttyStatusEnum.FOR_RENT,
    ],
    [ProperttyStatusEnum.SOLD]: [], // Une fois vendu, plus de transition
  };
  return rules[current] ?? [];
}

export function isPropertyTransitionAllowed(
  current: ProperttyStatusEnum,
  next: ProperttyStatusEnum,
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
  const parts = [property.address, property.city, property.postal_code, property.country].filter(
    Boolean,
  );
  return parts.join(', ') || 'Adresse non renseignée';
}

export function getPropertyLocationShort(property: PropertyModel): string {
  if (property.city && property.country) {
    return `${property.city}, ${property.country}`;
  }
  return property.city || property.country || 'Localisation inconnue';
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
    [UnitStatutEnum.AVAILABLE]: 'bg-green-100 text-green-700 border-green-200',
    [UnitStatutEnum.SOLD]: 'bg-gray-100 text-gray-700 border-gray-200',
    [UnitStatutEnum.RENTED]: 'bg-amber-100 text-amber-700 border-amber-200',
    [UnitStatutEnum.FOR_SALE]: 'bg-blue-100 text-blue-700 border-blue-200',
    [UnitStatutEnum.FOR_RENT]: 'bg-purple-100 text-purple-700 border-purple-200',
    [UnitStatutEnum.UNDER_RENOVATION]: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

export function getUnitStatusDotClass(status: UnitStatutEnum): string {
  const map: Record<UnitStatutEnum, string> = {
    [UnitStatutEnum.AVAILABLE]: 'bg-green-500',
    [UnitStatutEnum.SOLD]: 'bg-gray-500',
    [UnitStatutEnum.RENTED]: 'bg-amber-500',
    [UnitStatutEnum.FOR_SALE]: 'bg-blue-500',
    [UnitStatutEnum.FOR_RENT]: 'bg-purple-500',
    [UnitStatutEnum.UNDER_RENOVATION]: 'bg-orange-500',
  };
  return map[status] ?? 'bg-gray-400';
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

export function propertyTimeAgo(iso: string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  const h = Math.floor(min / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `il y a ${d}j`;
  if (h > 0) return `il y a ${h}h`;
  if (min > 0) return `il y a ${min}min`;
  return "à l'instant";
}

export function formatPropertyDate(iso: string, locale = 'fr-GN'): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}
