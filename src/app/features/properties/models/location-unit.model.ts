import { PropertyDocument } from './property-document.model';
import { UnitStatutEnum } from '../enums/unit-status.enum';
import { PropertyModel } from './property.model';
import { PropertyTypeModel } from './propety-type.model';
import { ILocationModel } from './location.model';
import { IUnitGallery } from './unit-gallery.model';
import { ILocataire } from '../../locataires/models/locataire.model';

export interface ILocationUnit {
  // ── Identification ──────────────────────────────────────
  id: number;
  property_id: number;
  unit_type_id: number | null;
  is_primary: boolean;
  
  // ── Codes ───────────────────────────────────────────────
  unit_code: string;
  unit_number: string | null;
  
  // ── Localisation ───────────────────────────────────────
  floor: number | null;
  lot_number: string | null;
  entrance: string | null;
  
  // ── Caractéristiques ───────────────────────────────────
  surface: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  
  // ── Finances ───────────────────────────────────────────
  rent_amount: number | null;
  security_deposit: number | null;
  monthly_charges: number | null;
  sale_price: number | null;
  
  // ── Statut ─────────────────────────────────────────────
  status: UnitStatutEnum;
  description: string | null;
  
  // ── Métadonnées ────────────────────────────────────────
  amenities: Record<string, string> | null;
  is_furnished: boolean;
  is_active: boolean;
  
  // ── Relations ──────────────────────────────────────────
  property?: PropertyModel;
  unit_type?: PropertyTypeModel;
  
  // ── Nouvelles relations ─────────────────────────────────
  current_locataire?: ILocataire;      // Locataire actuel (current_tenant)
  current_location?: ILocationModel;  // Contrat actuel (current_lease)
  locations?: ILocationModel[];              // Historique des contrats (leases)
  gallery?: IUnitGallery[];            // Photos de l'unité
  documents?: PropertyDocument[];      // Documents de l'unité
  
  // ── Timestamps ─────────────────────────────────────────
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}