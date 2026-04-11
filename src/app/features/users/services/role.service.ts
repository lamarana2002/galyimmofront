import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BASE_URL }          from '../../../shared/constants/app.constant';
import { IRole, IPermission } from '../models/role.model';
import { ApiResponse }        from '../../../shared/interfaces/api-response.interface';
import { CreateRolePayload, UpdateRolePayload, SyncPermissionsPayload } from '../interfaces/role-payload.interface';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http            = inject(HttpClient);
  private readonly baseUrl         = `${BASE_URL}/roles`;
  private readonly permissionsUrl  = `${BASE_URL}/permissions`;

  // ── ROLES ─────────────────────────────────────────────────────

  findAll(): Observable<ApiResponse<IRole[]>> {
    return this.http.get<ApiResponse<IRole[]>>(this.baseUrl);
  }

  findById(id: number): Observable<ApiResponse<IRole>> {
    return this.http.get<ApiResponse<IRole>>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateRolePayload): Observable<ApiResponse<IRole>> {
    return this.http.post<ApiResponse<IRole>>(this.baseUrl, payload);
  }

  update(payload: UpdateRolePayload): Observable<ApiResponse<IRole>> {
    const { id, ...data } = payload;
    return this.http.put<ApiResponse<IRole>>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  syncPermissions(id: number, payload: SyncPermissionsPayload): Observable<ApiResponse<IRole>> {
    return this.http.post<ApiResponse<IRole>>(`${this.baseUrl}/${id}/permissions`, payload);
  }

  // ── PERMISSIONS ───────────────────────────────────────────────

  allPermissions(): Observable<ApiResponse<IPermission[]>> {
    return this.http.get<ApiResponse<IPermission[]>>(this.permissionsUrl);
  }
}
