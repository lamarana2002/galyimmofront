import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '../../../shared/constants/app.constant';
import { FilterProperty } from '../interfaces/filter-property.interface';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { PropertyModel } from '../models/property.model';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PropertyKpis } from '../models/property-kpis.model';
import { CreatePropertyPayload } from '../interfaces/create-property-payload.interface';
import { UpdatePropertyPayload } from '../interfaces/update-property-payload.interface';
import { PropertyStatusEnum } from '../enums/property-status.enum';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/properties`;

  // ── READ ──────────────────────────────────────────────────────────

  /**
   * Liste paginée des propriétés
   * Filtres : search, status
   */
  findAll(params?: FilterProperty & IQueryParam): Observable<PaginatedResponse<PropertyModel>> {
    return this.http.get<PaginatedResponse<PropertyModel>>(this.baseUrl, {
      params: this.buildParams(params),
    });
  }

  /**
   * Détail d'une propriété par ID
   */
  findById(id: number): Observable<ApiResponse<PropertyModel>> {
    return this.http.get<ApiResponse<PropertyModel>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Récupère les propriétés d'une structure spécifique
   */
  findByStructure(
    structureId: number,
    params?: FilterProperty & IQueryParam,
  ): Observable<PaginatedResponse<PropertyModel>> {
    return this.http.get<PaginatedResponse<PropertyModel>>(
      `${BASE_URL}/structures/${structureId}/properties`,
      { params: this.buildParams(params) },
    );
  }

  /**
   * KPIs pour les cards en haut de page
   */
  getKpis(): Observable<PropertyKpis> {
    return this.http.get<PropertyKpis>(`${this.baseUrl}/stats`);
  }

  // ── CREATE ────────────────────────────────────────────────────────

  /**
   * Crée une nouvelle propriété
   * Gère cover_image en FormData
   */
  create(payload: CreatePropertyPayload): Observable<ApiResponse<PropertyModel>> {
    const body = this.toFormDataIfNeeded(payload);
    return this.http.post<ApiResponse<PropertyModel>>(this.baseUrl, body);
  }

  // ── UPDATE ────────────────────────────────────────────────────────

  /**
   * Met à jour une propriété
   */
  update(payload: UpdatePropertyPayload): Observable<ApiResponse<PropertyModel>> {
    const { id, ...data } = payload;
    const body = this.toFormDataIfNeeded(data);

    if (body instanceof FormData) {
      body.append('_method', 'PUT');
      return this.http.post<ApiResponse<PropertyModel>>(`${this.baseUrl}/${id}`, body);
    }

    return this.http.put<ApiResponse<PropertyModel>>(`${this.baseUrl}/${id}`, body);
  }

  /**
   * Change le statut d'une propriété (comme structures)
   */
  changeStatus(id: number, status: PropertyStatusEnum): Observable<ApiResponse<PropertyModel>> {
    return this.http.patch<ApiResponse<PropertyModel>>(`${this.baseUrl}/${id}/status`, { status });
  }

  // ── DELETE ────────────────────────────────────────────────────────

  /**
   * Suppression définitive
   */
  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Archive une propriété (soft delete)
   */
  archive(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}/archive`);
  }

  /**
   * Restaure une propriété archivée
   */
  restore(id: number): Observable<ApiResponse<PropertyModel>> {
    return this.http.post<ApiResponse<PropertyModel>>(`${this.baseUrl}/${id}/restore`, {});
  }

  // ── PRIVATE ───────────────────────────────────────────────────────

  private buildParams(params?: FilterProperty & IQueryParam): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    const map: Record<string, any> = {
      page: params.page,
      per_page: params.perPage,
      search: params.search,
      status: params.status,
    };

    Object.entries(map).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }

  private toFormDataIfNeeded(
    payload: Partial<CreatePropertyPayload>,
  ): FormData | Partial<CreatePropertyPayload> {
    const hasFile = payload.cover_image instanceof File;
    if (!hasFile) return payload;

    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value instanceof File) {
        form.append(key, value);
      } else if (value !== undefined && value !== null) {
        form.append(key, value.toString());
      }
    });

    return form;
  }
}
