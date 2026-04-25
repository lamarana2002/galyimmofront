export interface CreateRolePayload {
  name:         string;
  permissions?: number[];
}

export interface UpdateRolePayload {
  id:   number;
  name: string;
}

export interface SyncPermissionsPayload {
  permissions: number[];
}

export interface SyncRolesPayload {
  roles: string[];
}
