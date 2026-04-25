// ── INTERFACE POUR LES STATISTIQUES ─────────────────────────────────

export interface UnitStats {
  /** Nombre total d'unités */
  total_units: number;
  
  /** Unités louées */
  rented_units: number;
  
  /** Unités disponibles */
  available_units: number;
  
  /** Unités en travaux */
  under_renovation_units: number;
  
  /** Taux d'occupation (%) */
  occupancy_rate: number;
  
  /** Loyer total mensuel (somme des loyers des unités louées) */
  total_monthly_rent: number;
  
  /** Loyer total potentiel (somme des loyers de toutes les unités) */
  total_potential_rent: number;
  
  /** Charges totales mensuelles */
  total_monthly_charges: number;
}