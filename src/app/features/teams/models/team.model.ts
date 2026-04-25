export interface TeamModel {
  id: number;
  name: string;
  role?: string | null;
  description?: string | null;
  image?: string | null;
  is_public: boolean;
  sort_order: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}
