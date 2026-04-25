export interface ICountry {
  id: number;
  nom: string;
  code: string | null;
  indicatif: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface IRegion {
  id: number;
  country_id: number | null;
  nom: string;
  code: string | null;
  country?: ICountry;
  created_at: string;
  updated_at: string;
}

export interface IVille {
  id: number;
  region_id: number;
  nom: string;
  region?: IRegion;
  created_at: string;
  updated_at: string;
}

export interface ICommune {
  id: number;
  ville_id: number;
  nom: string;
  ville?: IVille;
  created_at: string;
  updated_at: string;
}

export interface IQuartier {
  id: number;
  commune_id: number;
  nom: string;
  commune?: ICommune;
  created_at: string;
  updated_at: string;
}

export interface ISquareArea {
  id: number;
  quartier_id: number;
  nom: string;
  code: string | null;
  quartier?: IQuartier;
  created_at: string;
  updated_at: string;
}

export interface IAdresse {
  id: number;
  square_area_id: number | null;
  repere: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  what3words: string | null;
  code_adresse: string | null;
  photo_repere: string | null;
  square_area?: ISquareArea;
  created_at: string;
  updated_at: string;
}
