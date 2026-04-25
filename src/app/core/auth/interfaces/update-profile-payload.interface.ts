export interface UpdateProfilePayload {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  genre?: 'Masculin' | 'Feminin';
  pays?: string;
  ville?: string;
  adresse?: string;
  description?: string | null;
  avatar?: File | null;
}
