export type FactureStatus = 'completed' | 'pending';

export interface Facture {
  id: number;
  reference: string;
  contract_id: number;
  amount: number;
  paid_amount: number;
  balance_due: number;
  date_echeance: string;
  period_start: string;
  period_end: string;
  status: FactureStatus;
  type: string;
  description: string | null;
  payments?: FacturePayment[];
  created_at: string;
  updated_at: string;
}

export interface FacturePayment {
  id: number;
  contract_id: number;
  facture_id: number;
  amount: number;
  method: string;
  paid_at: string;
  status: 'completed' | 'pending';
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddPaymentToFacturePayload {
  amount: number;
  method: string;
  notes?: string;
  paid_at?: string;
}

export interface FactureListResponse {
  success: boolean;
  data: Facture[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}
