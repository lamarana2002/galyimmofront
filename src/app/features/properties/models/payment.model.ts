// models/payement.model.ts

export interface Payement {
  id: number;
  location_id: number;
  montant: number;
  methode_payement: string;  // especes, virement, cheque, mobile_money
  description: string | null;
  recu: string | null;
  recu_url: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}