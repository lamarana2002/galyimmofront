import { ProperttyStatusEnum } from "../enums/property-status.enum";

export interface CreatePropertyPayload {
  structure_id: number;
  property_type_id: number;
  name: string;
  code?: string;
  has_units: boolean;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  total_surface?: number;
  total_floors?: number;
  sale_price?: number;
  condo_fees?: number;
  status: ProperttyStatusEnum;
  description?: string;
  cover_image?: File;
  amenities?: Record<string, any>;
  is_active?: boolean;
}

