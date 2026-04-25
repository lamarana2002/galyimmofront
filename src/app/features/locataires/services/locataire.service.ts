import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { toFormDataIfNeeded } from '../../../shared/utils/form-data.utils';

import { BASE_URL } from '../../../shared/constants/app.constant';
import { ILocataire } from '../models/locataire.model';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';
import { CreateLocatairePayload, UpdateLocatairePayload } from '../interfaces/locataire-payload.interface';

@Injectable({ providedIn: 'root' })
export class LocataireService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/locataires`;

  // ── READ ──────────────────────────────────────────────────────

  findAll(params?: IQueryParam & { search?: string }): Observable<PaginatedResponse<ILocataire>> {
    return this.http.get<PaginatedResponse<ILocataire>>(
      this.baseUrl,
      { params: this.buildParams(params) }
    );
  }

  findById(id: number): Observable<ApiResponse<ILocataire>> {
    return this.http.get<ApiResponse<ILocataire>>(`${this.baseUrl}/${id}`);
  }

  // ── CREATE ────────────────────────────────────────────────────

  create(payload: CreateLocatairePayload): Observable<ApiResponse<ILocataire>> {
    return this.http.post<ApiResponse<ILocataire>>(
      this.baseUrl,
      toFormDataIfNeeded(payload as unknown as Record<string, unknown>)
    );
  }

  // ── UPDATE ────────────────────────────────────────────────────

  update(payload: UpdateLocatairePayload): Observable<ApiResponse<ILocataire>> {
    const { id, ...data } = payload;
    const body = toFormDataIfNeeded(data as unknown as Record<string, unknown>);

    // Laravel nécessite _method=PUT pour les FormData
    if (body instanceof FormData) {
      body.append('_method', 'PUT');
      return this.http.post<ApiResponse<ILocataire>>(`${this.baseUrl}/${id}`, body);
    }

    return this.http.put<ApiResponse<ILocataire>>(`${this.baseUrl}/${id}`, body);
  }

  // ── DELETE ────────────────────────────────────────────────────

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  archive(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}/archive`);
  }

  restore(id: number): Observable<ApiResponse<ILocataire>> {
    return this.http.post<ApiResponse<ILocataire>>(`${this.baseUrl}/${id}/restore`, {});
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

}