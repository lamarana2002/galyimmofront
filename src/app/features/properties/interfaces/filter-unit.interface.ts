// ── INTERFACES POUR LES FILTRES ─────────────────────────────────────

import { ProperttyStatusEnum } from "../enums/property-status.enum";

export interface UnitFilters {
  /** ID de la propriété parent */
  property_id?: number;
  
  /** Statut de l'unité (loué, disponible, etc.) */
  status?: ProperttyStatusEnum | 'all';
  
  /** Type d'unité (appartement, studio, etc.) */
  unit_type_id?: number;
  
  /** Unité active ou non */
  is_active?: boolean;
  
  /** Unité principale ou non */
  is_primary?: boolean;
  
  /** Étage spécifique */
  floor?: number;
  
  /** Loyer minimum */
  min_rent?: number;
  
  /** Loyer maximum */
  max_rent?: number;
  
  /** Surface minimum */
  min_surface?: number;
  
  /** Surface maximum */
  max_surface?: number;
  
  /** Recherche textuelle (code, numéro) */
  search?: string;
}