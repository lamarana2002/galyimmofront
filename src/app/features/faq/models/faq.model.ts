export interface FaqModel {
  id: number;
  question: string;
  answer: string;
  is_visible: boolean;
  position: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}