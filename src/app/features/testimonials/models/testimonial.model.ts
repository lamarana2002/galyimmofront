export interface TestimonialModel {
  id: number;
  name: string;
  role?: string | null;
  content: string;
  note: number;
  image?: string | null;
  is_visible: boolean;
  position: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}
