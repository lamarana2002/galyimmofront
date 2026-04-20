export interface CreateUserPayload {
  prenom:                string;
  nom:                   string;
  login:                 string;
  email:                 string;
  telephone:             string;
  genre:                 string;
  pays?:                 string;
  ville?:                string;
  adresse?:              string;
  description?:          string;
  password:              string;
  password_confirmation: string;
  avatar?:               File;
  roles?:                number[];
}

export interface UpdateUserPayload {
  id:                     number;
  prenom?:                string;
  nom?:                   string;
  login?:                 string;
  email?:                 string;
  telephone?:             string;
  genre?:                 string;
  pays?:                  string;
  ville?:                 string;
  adresse?:               string;
  description?:           string;
  password?:              string;
  password_confirmation?: string;
  avatar?:                File;
  roles?:                 number[];
}
