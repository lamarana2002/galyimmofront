import { PropertyStatusEnum } from '../enums/property-status.enum';
import { PropertyGallery }     from './property-gallery.model';
import { PropertyDocument }    from './property-document.model';
import { PropertyStats }       from './property-stats.model';
import { PropertyTypeModel }   from './propety-type.model';
import { ILocationUnit } from './location-unit.model';

export interface PropertyModel {
  id: number;

  // ── Relations eager-loadées ─────────────────────────────
  structure_id:   number | null;
  property_type:  PropertyTypeModel;
  units?:         ILocationUnit[];       // has_units = true → unités manuelles
  gallery?:       PropertyGallery[];    // images du bien
  documents?:     PropertyDocument[];   // documents du bien
  stats:          PropertyStats;

  // ── Identification ──────────────────────────────────────
  code:  string | null;
  name:  string;

  // ── Clé architecture ────────────────────────────────────
  // false → bien simple, 1 unité primaire auto-créée côté backend
  // true  → bien subdivisé, unités créées manuellement
  has_units: boolean;

  // ── Adresse ─────────────────────────────────────────────
  address:     string | null;
  city:        string | null;
  postal_code: string | null;
  country:     string | null;
  latitude:    number | null;
  longitude:   number | null;

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