export interface PropertyTypeModel {
  /** ID unique du type de propriété */
  id: number;

  /** Nom du type (ex: Studio, Villa, Immeuble) */
  name: string;

  /** Identifiant machine pour les URLs et la logique (ex: studio, villa, immeuble) */
  slug: string;

  /** Description optionnelle du type de propriété */
  description: string | null;

  // ── Comportement du type ────────────────────────────────
  /**
   * Ce type de bien peut-il contenir des unités locatives ?
   * true = immeuble, résidence (peut avoir plusieurs unités)
   * false = studio, villa (bien simple sans unités)
   */
  can_have_units: boolean;

  /**
   * Peut être loué directement (bien simple)
   * true = peut être loué
   * false = ne peut pas être loué
   */
  is_rentable: boolean;

  /**
   * Peut être vendu
   * true = peut être vendu
   * false = ne peut pas être vendu
   */
  is_sellable: boolean;

  // ── UI / Angular ────────────────────────────────────────
  /** Nom de l'icône Lucide côté Angular (ex: lucideHome, lucideBuilding, lucideHotel) */
  icon: string | null;

  /** Ordre d'affichage dans les selects Angular (plus petit = premier) */
  sort_order: number;

  /** Statut actif/inactif */
  is_active: boolean;

  // ── Timestamps ──────────────────────────────────────────
  /** Date de création (format ISO) */
  created_at: string;

  /** Date de dernière modification (format ISO) */
  updated_at: string;
}

/**
 * Énumération des slugs de types de propriétés (optionnel)
 * Pour avoir des constantes réutilisables
 */
export enum PropertyTypeSlug {
  STUDIO = 'studio',
  APARTMENT = 'appartement',
  VILLA = 'villa',
  HOUSE = 'maison',
  BUILDING = 'immeuble',
  COMMERCIAL = 'commercial',
  OFFICE = 'bureau',
  WAREHOUSE = 'entrepot',
  LAND = 'terrain',
  PARKING = 'parking'
}

/**
 * Interface simplifiée pour les selects et listes déroulantes
 */
export interface PropertyTypeOption {
  value: number;        // id
  label: string;        // name
  icon?: string | null; // icon
  can_have_units?: boolean; // Pour filtrage conditionnel
}

/**
 * Extension avec les propriétés liées (si nécessaire)
 */
export interface PropertyTypeWithStats extends PropertyTypeModel {
  /** Nombre de propriétés de ce type */
  properties_count?: number;

  /** Nombre de propriétés actives de ce type */
  active_properties_count?: number;
}