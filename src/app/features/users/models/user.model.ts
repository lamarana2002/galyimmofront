import { UserRole } from "../../../core/auth/interfaces/auth-user.interface";
import { GenreEnum } from "../../../shared/enums/genre.enum";
import { UserStatus } from "../enums/user-status.enum";

export interface UserModel {
  // ── Clés ────────────────────────────────────────────────────────
  id:           number;
  structure_id: number | null;   // FK directe — pas de pivot

  // ── Identité ────────────────────────────────────────────────────
  prenom:      string;
  nom:         string;
  login:       string;
  email:       string;
  telephone:   string;
  genre:       GenreEnum;

  // ── Localisation ────────────────────────────────────────────────
  pays:    string;
  ville:   string;
  adresse: string;

  // ── Profil ──────────────────────────────────────────────────────
  description: string | null;
  avatar:      string;           // default: 'avatar.png'

  // ── Auth ────────────────────────────────────────────────────────
  status:             UserStatus;
  otp:                string | null;
  email_verified_at:  string | null;
  remember_token:     string | null;

  roles: UserRole[];

  // ── Timestamps ──────────────────────────────────────────────────
  created_at: string;
  updated_at: string;
}

// ── Champs calculés côté Angular ──────────────────────────────────
// (jamais stockés, toujours dérivés depuis UserModel)
export interface UserViewModel extends UserModel {
  fullName:     string;   // `${prenom} ${nom}`
  initials:     string;   // 'IC' depuis 'Ibrahim Camara'
  avatarUrl:    string;   // URL complète vers l'avatar
  isActive:     boolean;  // status === 'active'
  isVerified:   boolean;  // email_verified_at !== null
}

// ── Payload création user ─────────────────────────────────────────
// Correspond au RegisterPayload qu'on a déjà défini
export type CreateUserPayload = Omit<UserModel,
  'id' | 'structure_id' | 'avatar' | 'otp' |
  'email_verified_at' | 'remember_token' |
  'created_at' | 'updated_at'
> & {
  password:              string;
  password_confirmation: string;
  avatar?:               File;
};