// ── Modèle PropertyDocument ────────────────────────────────────
// Correspond à la table property_documents en base
export interface PropertyDocument {
  id:          number;
  property_id?: number;
  structure_id?: number;
  uploaded_by: number;

  type:        string;   // PropertyDocumentTypeEnum côté Laravel
  title:       string;
  description: string | null;

  file_path:      string;
  original_name:  string;
  file_size:      number;
  mime_type?:     string;
  url?:           string;
  type_label?:    string;

  reference_number:   string | null;
  issue_date:         string | null;  // YYYY-MM-DD
  expiry_date:        string | null;  // YYYY-MM-DD

  is_validated:        boolean;
  validation_comment:  string | null;
  validated_at:        string | null;
  validated_by:        number | null;

  is_active:  boolean;
  is_public:  boolean;

  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}