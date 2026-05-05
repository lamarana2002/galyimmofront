export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'mobile_money_manual';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  reference: string;          // Ex: FAC-2026-04-001 (généré par le backend)
  amount: number;             // Montant payé
  method: PaymentMethod;      // Comment le locataire a payé
  status: PaymentStatus;      // Statut (ex: "pending" si chèque non encaissé)
  paid_at: string;            // Date à laquelle l'argent a été reçu
  period_start: string;       // Début de la période couverte
  period_end: string;         // Fin de la période couverte
  contract_id: string;        // Lien unique vers le contrat de location
  notes?: string;             // Ex: "Chèque N° 123456"
  receipt_url?: string;       // Lien du reçu généré
  created_at: string;
}

// Payload envoyé par le formulaire Angular au Backend
export interface CreatePaymentPayload {
  contract_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paid_at: string;
  period_start: string;
  period_end: string;
  notes?: string;
}

// Interface pour le résumé financier d'un contrat
export interface ContractFinancialSummary {
  expected_rent: number;      // Loyer total attendu (base + charges)
  total_paid: number;         // Somme de tous les paiements "completed"
  balance_due: number;        // Reste à payer (expected_rent - total_paid)
}
