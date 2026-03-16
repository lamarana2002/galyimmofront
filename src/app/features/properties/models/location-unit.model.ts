import { ProperttyStatusEnum } from '../enums/property-status.enum';
import { PropertyModel } from './property.model';
import { PropertyTypeModel } from './propety-type.model';


/**
 * Interface représentant une unité locative (appartement, studio, bureau dans un immeuble)
 * Correspond à la table 'unite_locations' dans Laravel
 */
export interface LocationUnit {
  // ── Identification ──────────────────────────────────────
  /** ID unique de l'unité */
  id: number;

  // ── Relations ───────────────────────────────────────────
  /** ID du bien parent */
  property_id: number;
  
  /** ID du type d'unité (peut être différent du type du bien parent) */
  unit_type_id: number | null;

  // ── Clé architecture ────────────────────────────────────
  /**
   * true = unité auto-créée pour un bien simple (has_units = false)
   * Une seule unité primaire par bien
   * false = unité ajoutée manuellement pour un bien subdivisé
   */
  is_primary: boolean;

  // ── Identification ──────────────────────────────────────
  /** Code unique global. Ex: UNIT-0089 */
  unit_code: string;

  /** Numéro lisible. Ex: A01, 12B, "Principal" (si is_primary) */
  unit_number: string | null;

  // ── Localisation dans le bien ───────────────────────────
  /** Étage. 0 = RDC, -1 = sous-sol */
  floor: number | null;

  /** Numéro de lot pour copropriété */
  lot_number: string | null;

  /** Entrée / Bâtiment. Ex: Bât A, Entrée 2 */
  entrance: string | null;

  // ── Caractéristiques ────────────────────────────────────
  /** Surface en m² */
  surface: number | null;

  /** Nombre de pièces principales */
  rooms: number | null;

  /** Nombre de chambres */
  bedrooms: number | null;

  /** Nombre de salles de bain */
  bathrooms: number | null;

  /** Nombre de WC séparés */
  toilets: number | null;

  // ── Finances ────────────────────────────────────────────
  /** Loyer mensuel en GNF */
  rent_amount: number | null;

  /** Caution / dépôt de garantie en GNF */
  security_deposit: number | null;

  /** Charges mensuelles en GNF */
  monthly_charges: number | null;

  /** Prix de vente si l'unité est vendue séparément */
  sale_price: number | null;

  // ── Statut ──────────────────────────────────────────────
  /** Statut de l'unité */
  status: ProperttyStatusEnum;

  /** Description détaillée de l'unité */
  description: string | null;

  // ── Médias & Métadonnées ─────────────────────────────────
  /** Équipements spécifiques à l'unité : clim, meublé, balcon... */
  amenities: Record<string, any> | null;

  /** Indique si l'unité est meublée */
  is_furnished: boolean;

  /** Indique si l'unité est active */
  is_active: boolean;

  // ── Timestamps ──────────────────────────────────────────
  /** Date de création (format ISO) */
  created_at: string;

  /** Date de dernière modification (format ISO) */
  updated_at: string;

  /** Date d'archivage (soft delete) */
  deleted_at: string | null;
}

/**
 * Interface pour les relations chargées
 */
export interface LocationUnitWithRelations extends LocationUnit {
  /** Bien parent (si chargé) */
  property?: PropertyModel;
  
  /** Type d'unité (si chargé) */
  unit_type?: PropertyTypeModel;
}

/**
 * Interface pour la création/édition d'une unité
 */
export interface LocationUnitPayload {
  property_id: number;
  unit_type_id?: number | null;
  is_primary?: boolean;
  unit_number?: string | null;
  floor?: number | null;
  lot_number?: string | null;
  entrance?: string | null;
  surface?: number | null;
  rooms?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  toilets?: number | null;
  rent_amount?: number | null;
  security_deposit?: number | null;
  monthly_charges?: number | null;
  sale_price?: number | null;
  status?: ProperttyStatusEnum;
  description?: string | null;
  amenities?: Record<string, any> | null;
  is_furnished?: boolean;
  is_active?: boolean;
}

/**
 * Interface pour les filtres de recherche d'unités
 */
export interface LocationUnitFilters {
  property_id?: number;
  status?: ProperttyStatusEnum | 'all';
  is_active?: boolean;
  is_primary?: boolean;
  unit_type_id?: number;
  floor?: number;
  min_rent?: number;
  max_rent?: number;
  min_surface?: number;
  max_surface?: number;
  search?: string;
}