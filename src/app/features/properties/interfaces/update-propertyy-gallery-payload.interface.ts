import { CreatePropertyGalleryPayload } from "./create-property-gallery-payload.interface";

export interface UpdatePropertyGalleryPayload extends Partial<CreatePropertyGalleryPayload> {
  id: number;
}