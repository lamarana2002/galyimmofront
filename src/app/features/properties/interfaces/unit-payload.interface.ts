import { PropertyStatusEnum } from '../enums/property-status.enum';

// ── Création d'une unité ───────────────────────────────────────
export interface CreateUnitPayload {
  property_id:  number;

  // Optionnels
  unit_type_id?:     number | null;
  is_primary?:       boolean;
  unit_number?:      string | null;
  floor?:            number | null;
  lot_number?:       string | null;
  entrance?:         string | null;
  surface?:          number | null;
  rooms?:            number | null;
  bedrooms?:         number | null;
  bathrooms?:        number | null;
  toilets?:          number | null;
  rent_amount?:      number | null;
  security_deposit?: number | null;
  monthly_charges?:  number | null;
  sale_price?:       number | null;
  status?:           PropertyStatusEnum;
  description?:      string | null;
  amenities?:        Record<string, string> | null;
  is_furnished?:     boolean;
  is_active?:        boolean;
  model_3d?:         File | null;
}

// ── Mise à jour d'une unité ────────────────────────────────────
export interface UpdateUnitPayload extends Partial<Omit<CreateUnitPayload, 'property_id'>> {
  id: number;
}

// ── Valeur initiale du formulaire unité ────────────────────────
// Utilisé par openAddUnit() et openEditUnit()
export function emptyUnitForm(propertyId: number): CreateUnitPayload {
  return {
    property_id:       propertyId,
    unit_type_id:      null,
    is_primary:        false,
    unit_number:       null,
    floor:             null,
    lot_number:        null,
    entrance:          null,
    surface:           null,
    rooms:             null,
    bedrooms:          null,
    bathrooms:         null,
    toilets:           null,
    rent_amount:       null,
    security_deposit:  null,
    monthly_charges:   null,
    sale_price:        null,
    status:            PropertyStatusEnum.AVAILABLE,
    description:       null,
    amenities:         null,
    is_furnished:      false,
    is_active:         true,
    model_3d:          null,
  };
}

// ── Mapping LocationUnit → UpdateUnitPayload ───────────────────
// Utilisé par openEditUnit() pour pré-remplir le formulaire
import { ILocationUnit } from '../models/location-unit.model';

export function unitToUpdatePayload(unit: ILocationUnit): UpdateUnitPayload {
  return {
    id:                unit.id,
    unit_type_id:      unit.unit_type_id,
    is_primary:        unit.is_primary,
    unit_number:       unit.unit_number,
    floor:             unit.floor,
    lot_number:        unit.lot_number,
    entrance:          unit.entrance,
    surface:           unit.surface,
    rooms:             unit.rooms,
    bedrooms:          unit.bedrooms,
    bathrooms:         unit.bathrooms,
    toilets:           unit.toilets,
    rent_amount:       unit.rent_amount,
    security_deposit:  unit.security_deposit,
    monthly_charges:   unit.monthly_charges,
    sale_price:        unit.sale_price,
    status:            unit.status as unknown as PropertyStatusEnum,
    description:       unit.description,
    amenities:         unit.amenities,
    is_furnished:      unit.is_furnished,
    is_active:         unit.is_active,
  };
}