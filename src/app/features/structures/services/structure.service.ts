import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { StructureModel } from '../models/structure.model';
import { StructureStatus } from '../enums/structure-status.enum';
import { BASE_URL } from '../../../shared/constants/app.constant';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { StructureKpis } from '../models/structure-kpis.model';
import { CreateStructurePayload } from '../interfaces/create-structure-payload.interface';
import { UpdateStructurePayload } from '../interfaces/update-structure-payload.interface';
import { FilterStructure } from '../interfaces/filter-structure.interface';

@Injectable({ providedIn: 'root' })
export class StructureService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/structures`;

  // ── READ ──────────────────────────────────────────────────────────

  /**
   * Liste paginée des structures
   * Les filtres (search, status, plan) sont envoyés au backend
   * → pas de filtrage côté Angular sur cette liste
   */
  findAll(params?: IQueryParam): Observable<PaginatedResponse<StructureModel>> {
    return this.http.get<PaginatedResponse<StructureModel>>(
      this.baseUrl,
      { params: this.buildParams(params) }
    );
  }

  /**
   * Détail d'une structure par ID
   */
  findById(id: number): Observable<ApiResponse<StructureModel>> {
    return this.http.get<ApiResponse<StructureModel>>(`${this.baseUrl}/${id}`);
  }

  /**
   * KPIs globaux — appelé une seule fois pour les cards en haut de page
   * Retourne : total, active, pending, suspended, rejected, premium, freemium
   */
  getKpis(): Observable<StructureKpis> {
    return this.http.get<StructureKpis>(`${this.baseUrl}/stats`);
  }

  // ── CREATE ────────────────────────────────────────────────────────

  /**
   * Crée une nouvelle structure
   * Envoie en FormData si logo ou cover sont présents (fichiers)
   */
  create(payload: CreateStructurePayload): Observable<ApiResponse<StructureModel>> {
    const body = this.toFormDataIfNeeded(payload);
    return this.http.post<ApiResponse<StructureModel>>(this.baseUrl, body);
  }

  // ── UPDATE ────────────────────────────────────────────────────────

  /**
   * Met à jour les infos d'une structure
   * Envoie en FormData si logo ou cover sont présents (fichiers)
   */
  update(payload: UpdateStructurePayload): Observable<ApiResponse<StructureModel>> {
    const { id, ...data } = payload;
    const body = this.toFormDataIfNeeded(data);

    // Laravel nécessite _method=PUT pour les FormData
    if (body instanceof FormData) {
      body.append('_method', 'PUT');
      return this.http.post<ApiResponse<StructureModel>>(`${this.baseUrl}/${id}`, body);
    }

    return this.http.put<ApiResponse<StructureModel>>(`${this.baseUrl}/${id}`, body);
  }

  /**
   * Change le statut d'une structure
   * Les transitions autorisées sont vérifiées côté backend ET frontend (utils)
   */
  changeStatus(id: number, status: StructureStatus): Observable<ApiResponse<StructureModel>> {
    return this.http.put<ApiResponse<StructureModel>>(
      `${this.baseUrl}/${id}/status`,
      { status }
    );
  }

  /**
   * Bascule le plan d'une structure (Freemium ↔ Premium)
   * Le backend détermine le nouveau plan — pas besoin de l'envoyer
   */
  togglePlan(id: number): Observable<ApiResponse<StructureModel>> {
    return this.http.put<ApiResponse<StructureModel>>(
      `${this.baseUrl}/${id}/plan`,
      {}
    );
  }

  // ── DELETE ────────────────────────────────────────────────────────

  /**
   * Suppression définitive (hard delete)
   */
  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Suppression en lot
   * Convention maison : POST /batch-delete avec { ids: number[] }
   */
  deleteMany(ids: number[]): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/batch-delete`, { ids });
  }

  /**
   * Archive une structure (soft delete — deleted_at)
   */
  archive(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}/archive`);
  }

  /**
   * Restaure une structure archivée
   */
  restore(id: number): Observable<ApiResponse<StructureModel>> {
    return this.http.post<ApiResponse<StructureModel>>(`${this.baseUrl}/${id}/restore`, {});
  }

  // ── PRIVATE ───────────────────────────────────────────────────────

  /**
   * Construit les HttpParams depuis IQueryParam
   * Ignore les valeurs null/undefined/vides
   */
  private buildParams(query?: IQueryParam & FilterStructure): HttpParams {
    let params = new HttpParams();
    if (!query) return params;

    const map: Record<string, any> = {
      page:     query.page,
      per_page: query.perPage,
      search:   query.search,
      status:   query.status,
      plan:     query.plan,
    };

    Object.entries(map).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return params;
  }

  /**
   * Convertit un payload en FormData si des fichiers sont présents
   * Sinon retourne le payload tel quel (JSON)
   */
  private toFormDataIfNeeded(
    payload: Partial<CreateStructurePayload>
  ): FormData | Partial<CreateStructurePayload> {
    const hasFile = payload.logo instanceof File || payload.cover instanceof File;
    if (!hasFile) return payload;

    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value instanceof File) {
        form.append(key, value);
      } else if (typeof value === 'boolean') {
        form.append(key, value ? '1' : '0');
      } else if (value !== undefined && value !== null) {
        form.append(key, value.toString());
      }
    });

    return form;
  }
}