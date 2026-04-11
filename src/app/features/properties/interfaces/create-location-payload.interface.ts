export interface CreateLocationPayload {
  client:          number;   // locataire_id
  immeuble:        number;   // property_id
  uniteLocation:   number;   // unit_id
  interval:        number;   // nombre de mois (1, 3, 6, 12...)
  montant:         number;
  methodePayement: string;
  date:            string;   // YYYY-MM-DD
  image:           File;     // contrat (obligatoire)
}
