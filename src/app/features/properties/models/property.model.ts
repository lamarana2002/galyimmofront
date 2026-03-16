import { ProperttyStatusEnum } from "../enums/property-status.enum";
import { LocationUnit } from "./location-unit.model";
import { PropertyStats } from "./property-stats.model";
import { PropertyTypeModel } from "./propety-type.model";

export interface PropertyModel {
  id: number;

  // Relations
  structure_id: number | null;
  property_type: PropertyTypeModel;
  units: LocationUnit[];

  // Identification
  code: string | null;
  name: string;

  // Clé architecture
  has_units: boolean;

  // Adresse
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;

  // Caractéristiques
  total_surface: number | null;
  total_floors: number | null;

  // Finances
  sale_price: number | null;
  condo_fees: number | null;

  // Statut
  status: ProperttyStatusEnum;
  description: string | null;

  // Médias
  cover_image: string | null;

  // Métadonnées
  amenities: Record<string, any> | null; // JSON object
  is_active: boolean;

  // Timestamps
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  deleted_at: string | null;

  // Les Stats
  stats: PropertyStats;
}

// Interface pour les relations chargées (optionnel)
// export interface PropertyWithRelations extends PropertyModel {
//   structure?: {
//     id: number;
//     name: string;
//     // autres champs de structure
//   };
//   property_type?: {
//     id: number;
//     name: string;
//     // autres champs de property_type
//   };
//   units?: PropertyUnitModel[]; // Si tu as des unités
//   units_count?: number;
// }