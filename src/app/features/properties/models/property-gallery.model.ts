export interface PropertyGallery {
  id: number;
  property_id: number;
  image: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  deleted_at: string | null; // ISO date string or null
}