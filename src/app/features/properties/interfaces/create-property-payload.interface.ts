import { PropertyStatusEnum } from "../enums/property-status.enum";

export interface CreatePropertyPayload {
  structure_id: number;
  property_type_id: number;
  name: string;
  code?: string;
  has_units: boolean;
  square_area_id?: number | null;
  repere?: string;
  latitude?: number | string;
  longitude?: number | string;
  what3words?: string;
  total_surface?: number;
  total_floors?: number;
  sale_price?: number;
  condo_fees?: number;
  status: PropertyStatusEnum;
  description?: string;
  cover_image?: File;
  amenities?: Record<string, any>;
  is_active?: boolean;
}

