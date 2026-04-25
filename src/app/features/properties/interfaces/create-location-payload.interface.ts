export interface CreateLocationPayload {
  locataire_id:       number;
  unite_locations_id: number;
  interval:           number;
  methode_payement:   string;
  date_location:      string;
  description?:       string;
}
