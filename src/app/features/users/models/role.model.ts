export interface IPermission {
  id:         number;
  name:       string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface IRole {
  id:                 number;
  name:               string;
  guard_name:         string;
  permissions?:       IPermission[];
  users_count?:       number;
  permissions_count?: number;
  created_at:         string;
  updated_at:         string;
}
