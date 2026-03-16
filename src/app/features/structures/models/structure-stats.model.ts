export interface StructureStats {
  employes:  number;   // COUNT(users WHERE structure_id = id)
  biens:     number;   // COUNT(properties WHERE structure_id = id)
  locations: number;   // COUNT(unite_locations WHERE status = 'rented')
}