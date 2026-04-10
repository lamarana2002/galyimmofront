import { ILocationModel } from "../../properties/models/location.model";

export interface ILocataire {
  id: number;
  nom: string;
  prenom: string;
  full_name: string;
  telephone: string;
  email: string;
  sexe: string | null;
  description: string | null;
  avatar: string;
  status: 'actif' | 'archive';
  
  // Relations
  locations?: ILocationModel[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}