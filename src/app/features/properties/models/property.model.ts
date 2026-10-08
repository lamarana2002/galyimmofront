import { PropertyStatusEnum } from '../enums/property-status.enum';
import { PropertyGallery }     from './property-gallery.model';
import { PropertyDocument }    from './property-document.model';
import { PropertyStats }       from './property-stats.model';
import { PropertyTypeModel }   from './property-type.model';
import { ILocationUnit } from './location-unit.model';
import { UnitStatutEnum } from '../enums/unit-status.enum';
import { IAdresse } from '../../../shared/models/adresse.model';

// Sous-ensemble d'ILocationUnit renvoyé par la liste des biens (has_units = false)
export interface PropertyPrimaryUnit {
  id: number;
  unit_code: string;
  unit_number: string | null;
  surface: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  rent_amount: number | null;
  security_deposit: number | null;
  monthly_charges: number | null;
  status: UnitStatutEnum;
}

export interface PropertyModel {
  id: number;

  // ── Relations eager-loadées ─────────────────────────────
  structure_id:   number | null;
  property_type:  PropertyTypeModel;
  units?:         ILocationUnit[];       // has_units = true → unités manuelles
  primary_unit?:  PropertyPrimaryUnit | null; // has_units = false → unité auto-créée
  units_count?:   number;
  gallery?:       PropertyGallery[];    // images du bien
  documents?:     PropertyDocument[];   // documents du bien
  stats:          PropertyStats;

  // ── Relation Adresse ────────────────────────────────────
  adresse_id: number | null;
  adresse?:   IAdresse | null;

  // ── Identification ──────────────────────────────────────
  code:  string | null;
  name:  string;

  // ── Clé architecture ────────────────────────────────────
  // false → bien simple, 1 unité primaire auto-créée côté backend
  // true  → bien subdivisé, unités créées manuellement
  has_units: boolean;

  // ── Caractéristiques ────────────────────────────────────
  total_surface: number | null;
  total_floors:  number | null;

  // ── Finances ────────────────────────────────────────────
  sale_price: number | null;
  condo_fees: number | null;

  // ── Statut ──────────────────────────────────────────────
  status:      PropertyStatusEnum;
  description: string | null;

  // ── Médias ──────────────────────────────────────────────
  cover_image: string | null;

  // ── Métadonnées ─────────────────────────────────────────
  amenities: Record<string, string> | null;
  is_active: boolean;

  // ── Timestamps ──────────────────────────────────────────
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}