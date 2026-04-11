import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BASE_URL }              from '../../../shared/constants/app.constant';
import { UserModel }             from '../models/user.model';
import { PaginatedResponse }     from '../../../shared/interfaces/paginated-response.interface';
import { ApiResponse }           from '../../../shared/interfaces/api-response.interface';
import { IQueryParam }           from '../../../shared/interfaces/query-parms.interface';
import { CreateUserPayload, UpdateUserPayload } from '../interfaces/user-payload.interface';
import { SyncRolesPayload }      from '../interfaces/role-payload.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/users`;

  // ── READ ──────────────────────────────────────────────────────

  findAll(params?: IQueryParam & { search?: string }): Observable<PaginatedResponse<UserModel>> {
    return this.http.get<PaginatedResponse<UserModel>>(
      this.baseUrl,
      { params: this.buildParams(params) }
    );
  }

  findById(id: number): Observable<ApiResponse<UserModel>> {
    return this.http.get<ApiResponse<UserModel>>(`${this.baseUrl}/${id}`);
  }

  // ── CREATE ────────────────────────────────────────────────────

  create(payload: CreateUserPayload): Observable<ApiResponse<UserModel>> {
    return this.http.post<ApiResponse<UserModel>>(
      this.baseUrl,
      this.toFormDataIfNeeded(payload)
    );
  }

  // ── UPDATE ────────────────────────────────────────────────────

  update(payload: UpdateUserPayload): Observable<ApiResponse<UserModel>> {
    const { id, ...data } = payload;
    const body = this.toFormDataIfNeeded(data);

    if (body instanceof FormData) {
      body.append('_method', 'PUT');
      return this.http.post<ApiResponse<UserModel>>(`${this.baseUrl}/${id}`, body);
    }

    return this.http.put<ApiResponse<UserModel>>(`${this.baseUrl}/${id}`, body);
  }

  // ── DELETE ────────────────────────────────────────────────────

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  // ── RÔLES ─────────────────────────────────────────────────────

  syncRoles(id: number, payload: SyncRolesPayload): Observable<ApiResponse<UserModel>> {
    return this.http.post<ApiResponse<UserModel>>(`${this.baseUrl}/${id}/roles`, payload);
  }

  // ── PRIVATE ───────────────────────────────────────────────────

  private buildParams(params?: IQueryParam & { search?: string }): HttpParams {
    let p = new HttpParams();
    if (!params) return p;

    const map: Record<string, any> = {
      page:     params.page,
      per_page: params.perPage,
      search:   params.search,
    };

    Object.entries(map).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, value.toString());
      }
    });

    return p;
  }

  private toFormDataIfNeeded(
    payload: Partial<CreateUserPayload> | Omit<UpdateUserPayload, 'id'>
  ): FormData | typeof payload {
    if (!('avatar' in payload) || !(payload.avatar instanceof File)) return payload;

    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'roles' && Array.isArray(value)) {
        value.forEach(r => form.append('roles[]', r));
      } else if (value instanceof File) {
        form.append(key, value);
      } else if (value !== undefined && value !== null) {
        form.append(key, value.toString());
      }
    });

    return form;
  }
}
