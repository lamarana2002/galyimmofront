// models/location.model.ts

import { PropertyModel } from './property.model';
import { Payement } from './payment.model';
import { ILocationUnit } from './location-unit.model';
import { ILocataire } from '../../locataires/models/locataire.model';
import { LocationStatusEnum } from '../enums/location-status.enum';

export interface ILocationFactureSummary {
  id: number;
  reference: string;
  contract_id: number;
  amount: number;
  paid_amount: number;
  status?: string;
}

export interface ILocationFinancialSummary {
  expected_rent: number;
  total_paid: number;
  balance_due: number;
}

export interface ILocationModel {
  id: number;
  reference?: string;          // Ex: CTR-2026-00030
  locataire_id: number;
  property_id: number;
  unite_locations_id: number;
  description: string | null;
  status: LocationStatusEnum;
  date_location: string;      // Date de début
  montant: number;             // Loyer mensuel
  interval: string | null;     // Date d'échéance/prochain renouvellement
  contrat_url: string | null;  // URL du contrat PDF
  payment_status?: string;              // Ex: "en retard", "a jour"
  jours_restants?: number;              // Jours restants avant échéance (négatif = en retard)
  financial_summary?: ILocationFinancialSummary;
  factures?: ILocationFactureSummary[];

  // Relations
  locataire?: ILocataire;
  property?: PropertyModel;
  unite_location?: ILocationUnit;
  payements?: Payement[];

  // Timestamps
  created_at: string;
  updated_at: string;
  end_date?: string;   // Date de fin calculée (ancien nom)
  date_fin?: string;   // Date de fin calculée (nouveau nom, contrat enrichi)
}