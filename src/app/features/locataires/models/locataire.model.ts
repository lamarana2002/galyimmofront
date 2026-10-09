import { UserStatusEnum } from "../enums/user-status.enum";
import { PropertyModel } from "../../properties/models/property.model";
import { ILocationUnit } from "../../properties/models/location-unit.model";

// Résumé d'une location tel que renvoyé par GET /locataires/{id}.
// status est une chaîne libre (ex: "en cours"), pas un LocationStatusEnum.
export interface ILocataireLocationSummary {
  id: number;
  property_id: number;
  unite_locations_id: number;
  property?: PropertyModel;
  unite_location?: ILocationUnit;
  date_location: string;
  montant: number;
  status: string;
}

export interface ILocataire {
  id: number;
  nom: string;
  prenom: string;
  full_name: string;
  telephone: string;
  email: string;
  sexe: string | null;
  description: string | null;
  image: string;
  status: UserStatusEnum;

  // Relations
  locations?: ILocataireLocationSummary[];

  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}