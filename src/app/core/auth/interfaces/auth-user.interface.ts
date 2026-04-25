// Correspond exactement à la migration users (snake_case Laravel)
export interface AuthUser {
  id:           number;
  structure_id: number | null;

  // Identité
  prenom:    string;
  nom:       string;
  login:     string;
  email:     string;
  telephone: string;
  genre:     'Masculin' | 'Feminin';

  // Localisation
  pays:    string;
  ville:   string;
  adresse: string;

  // Profil
  avatar:      string;        // 'avatar.png' par défaut
  description: string | null;

  // Auth
  status:             string;
  email_verified_at:  string | null;

  // Champs calculés/ajoutés par l'API
  roles:         UserRole[];
  hasStructure: boolean;      // structure_id !== null

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ── Types ─────────────────────────────────────────────────────────
export interface RolePermission {
    id: number;
    name: string;
    guard_name?: string;
}

export interface UserRole {
    id: number;
    name: string;
    guard_name?: string;
    permissions?: RolePermission[];
}