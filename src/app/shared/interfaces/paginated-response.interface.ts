// shared/interfaces/paginated-response.interface.ts
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];  // ← Le type T sera remplacé par ton modèle
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}