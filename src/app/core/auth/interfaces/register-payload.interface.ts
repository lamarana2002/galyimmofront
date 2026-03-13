export interface RegisterPayload {
  structure: StructurePayload;
  user: UserPayload;
}
export interface StructurePayload {
  name: string;
  cover: string,
  logo: string,
  plan: 'freemium' | 'premium';
  web_site?: string;
  facebook?: string;
  description?: string;
}
export interface UserPayload {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  login: string;
  genre: 'Masculin' | 'Feminin' | string;
  description?: string;
  pays: string;
  ville: string;
  adresse: string;
  password: string;
  password_confirmation: string;
//   newsletter?: boolean;
//   accept_terms: boolean;
}