export interface CreatePropertyGalleryPayload {
  property_id: number;
  image: File;
  caption?: string | null;
  is_cover?: boolean;
}