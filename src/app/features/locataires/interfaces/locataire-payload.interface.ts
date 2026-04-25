// ── Création d'un locataire ────────────────────────────────────

import { ILocataire } from "../models/locataire.model";

// Correspond à la validation Laravel : store()
export interface CreateLocatairePayload {
  nom:         string;   // nom
  prenom:       string;
  sexe:         string;
  telephone:    string;
  email:        string;
  description:  string;
  image?:      File;     // optionnel — envoyé en FormData si présent
}

// ── Mise à jour d'un locataire ─────────────────────────────────
// Correspond à la validation Laravel : update()
// description non requise en update
export interface UpdateLocatairePayload {
  id:           number;
  nom:         string;
  prenom:       string;
  sexe:         string;
  telephone:    string;
  email:        string;
  description?: string;
  image?:      File;
}

// ── Valeur initiale du formulaire ──────────────────────────────
export function emptyLocataireForm(): CreateLocatairePayload {
  return {
    nom:        '',
    prenom:      '',
    sexe:        '',
    telephone:   '',
    email:       '',
    description: '',
    image:      undefined,
  };
}

export function locataireToUpdatePayload(l: ILocataire): UpdateLocatairePayload {
  return {
    id:          l.id,
    nom:        l.nom,
    prenom:      l.prenom,
    sexe:        l.sexe ?? '',
    telephone:   l.telephone,
    email:       l.email,
    description: l.description ?? '',
  };
}