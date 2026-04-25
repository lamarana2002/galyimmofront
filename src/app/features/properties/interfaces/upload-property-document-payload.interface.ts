import { PropertyDocumentTypeEnum } from "../enums/property-document-type.enum";

// ── Payload upload document ────────────────────────────────────
// Envoyé en FormData (file obligatoire)
export interface UploadPropertyDocumentPayload {
  property_id?:      number;
  structure_id?:     number;
  type:             PropertyDocumentTypeEnum;
  title:            string;
  file:             File;
  description?:     string;
  reference_number?: string;
  issue_date?:      string;
  expiry_date?:     string;
  is_public?:       boolean;
}