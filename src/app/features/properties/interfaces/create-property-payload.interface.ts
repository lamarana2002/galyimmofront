import { PropertyStatusEnum } from "../enums/property-status.enum";

export interface CreatePropertyPayload {
  structure_id: number;
  property_type_id: number;
  name: string;
  code?: string | null;
  has_units: boolean;
  square_area_id?: number | null;
  repere?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  what3words?: string | null;
  total_surface?: number | null;
  total_floors?: number | null;
  sale_price?: number | null;
  condo_fees?: number | null;
  status: PropertyStatusEnum;
  description?: string | null;
  cover_image?: File;
  amenities?: Record<string, string> | null;
  is_active?: boolean;
  primary_unit?: {
    rooms?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    rent_amount?: number | null;
    security_deposit?: number | null;
    monthly_charges?: number | null;
  } | null;
}

