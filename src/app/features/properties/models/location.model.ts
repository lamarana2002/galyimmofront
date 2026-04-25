// models/location.model.ts

import { PropertyModel } from './property.model';
import { Payement } from './payment.model';
import { ILocationUnit } from './location-unit.model';
import { ILocataire } from '../../locataires/models/locataire.model';
import { LocationStatusEnum } from '../enums/location-status.enum';

export interface ILocationModel {
  id: number;
  locataire_id: number;
  property_id: number;
  unite_locations_id: number;
  description: string | null;
  status: LocationStatusEnum;
  date_location: string;      // Date de début
  montant: number;             // Loyer mensuel
  interval: string | null;     // Date d'échéance/prochain renouvellement
  contrat_url: string | null;  // URL du contrat PDF
  
  // Relations
  locataire?: ILocataire;
  property?: PropertyModel;
  unite_location?: ILocationUnit;
  payements?: Payement[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  end_date?: string;  // Date de fin calculée
}