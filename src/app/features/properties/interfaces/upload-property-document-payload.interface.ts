// ── Payload upload document ────────────────────────────────────
// Envoyé en FormData (file obligatoire)
export interface UploadPropertyDocumentPayload {
  property_id:      number;
  type:             string;
  title:            string;
  file:             File;
  description?:     string;
  reference_number?: string;
  issue_date?:      string;
  expiry_date?:     string;
  is_public?:       boolean;
}