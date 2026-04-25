import { ILocationModel } from "../../properties/models/location.model";
import { UserStatusEnum } from "../enums/user-status.enum";

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
  locations?: ILocationModel[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}