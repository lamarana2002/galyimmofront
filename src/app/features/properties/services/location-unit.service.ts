// services/location-unit.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../shared/constants/app.constant';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { ILocationUnit } from '../models/location-unit.model';
import { CreateUnitPayload, UpdateUnitPayload } from '../interfaces/unit-payload.interface';
import { UnitStatutEnum } from '../enums/unit-status.enum';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';
import { UnitStats } from '../models/unit-stats.model';
import { UnitFilters } from '../interfaces/filter-unit.interface';

@Injectable({ providedIn: 'root' })
export class LocationUnitService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/units`; // ou /location-units selon ton API

  // ── READ ──────────────────────────────────────────────────────────

  /**
   * Liste paginée des unités
   * Filtres : property_id, status, search, etc.
   */
  findAll(params?: UnitFilters & IQueryParam): Observable<PaginatedResponse<ILocationUnit>> {
    return this.http.get<PaginatedResponse<ILocationUnit>>(this.baseUrl, {
      params: this.buildParams(params),
    });
  }

  /**
   * Détail d'une unité par ID
   */
  findById(id: number): Observable<ApiResponse<ILocationUnit>> {
    return this.http.get<ApiResponse<ILocationUnit>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Récupère toutes les unités d'une propriété spécifique
   */
  findByPropertyId(
    propertyId: number,
    params?: UnitFilters & IQueryParam,
  ): Observable<PaginatedResponse<ILocationUnit>> {
    return this.http.get<PaginatedResponse<ILocationUnit>>(
      `${BASE_URL}/properties/${propertyId}/units`,
      { params: this.buildParams(params) },
    );
  }

  /**
   * Récupère l'unité principale d'une propriété (is_primary = true)
   * Utile pour les biens simples (has_units = false)
   */
  findPrimaryByPropertyId(propertyId: number): Observable<ApiResponse<ILocationUnit>> {
    return this.http.get<ApiResponse<ILocationUnit>>(
      `${BASE_URL}/properties/${propertyId}/primary-unit`,
    );
  }

  /**
   * Récupère les unités par statut
   */
  findByStatus(
    status: UnitStatutEnum,
    params?: IQueryParam,
  ): Observable<PaginatedResponse<ILocationUnit>> {
    return this.http.get<PaginatedResponse<ILocationUnit>>(`${this.baseUrl}/status/${status}`, {
      params: this.buildParams(params),
    });
  }

  /**
   * Récupère les unités disponibles (libres)
   */
  findAvailable(params?: IQueryParam): Observable<PaginatedResponse<ILocationUnit>> {
    return this.http.get<PaginatedResponse<ILocationUnit>>(`${this.baseUrl}/available`, {
      params: this.buildParams(params),
    });
  }

  /**
   * Récupère les unités louées
   */
  findRented(params?: IQueryParam): Observable<PaginatedResponse<ILocationUnit>> {
    return this.http.get<PaginatedResponse<ILocationUnit>>(`${this.baseUrl}/rented`, {
      params: this.buildParams(params),
    });
  }

  // ── CREATE ────────────────────────────────────────────────────────

  /**
   * Crée une nouvelle unité locative
   */
  create(payload: CreateUnitPayload): Observable<ApiResponse<ILocationUnit>> {
    return this.http.post<ApiResponse<ILocationUnit>>(this.baseUrl, payload);
  }

  /**
   * Crée plusieurs unités en une seule fois (pour un immeuble)
   */
  createMultiple(payloads: CreateUnitPayload[]): Observable<ApiResponse<ILocationUnit[]>> {
    return this.http.post<ApiResponse<ILocationUnit[]>>(`${this.baseUrl}/bulk`, { units: payloads });
  }

  // ── UPDATE ────────────────────────────────────────────────────────

  /**
   * Met à jour une unité
   */
  update(payload: UpdateUnitPayload): Observable<ApiResponse<ILocationUnit>> {
    const { id, ...data } = payload;
    return this.http.put<ApiResponse<ILocationUnit>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Change le statut d'une unité (loué, disponible, en travaux...)
   */
  changeStatus(id: number, status: UnitStatutEnum): Observable<ApiResponse<ILocationUnit>> {
    return this.http.patch<ApiResponse<ILocationUnit>>(`${this.baseUrl}/${id}/status`, { status });
  }

  /**
   * Met à jour uniquement les informations financières d'une unité
   */
  updateFinancials(
    id: number,
    financials: {
      rent_amount?: number;
      security_deposit?: number;
      monthly_charges?: number;
      sale_price?: number;
    },
  ): Observable<ApiResponse<ILocationUnit>> {
    return this.http.patch<ApiResponse<ILocationUnit>>(`${this.baseUrl}/${id}/financials`, financials);
  }

  // ── DELETE ────────────────────────────────────────────────────────

  /**
   * Suppression définitive d'une unité
   */
  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Archive une unité (soft delete)
   */
  archive(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}/archive`);
  }

  /**
   * Restaure une unité archivée
   */
  restore(id: number): Observable<ApiResponse<ILocationUnit>> {
    return this.http.post<ApiResponse<ILocationUnit>>(`${this.baseUrl}/${id}/restore`, {});
  }

  // ── STATS ─────────────────────────────────────────────────────────

  /**
   * Récupère les statistiques pour une propriété
   */
  getStatsByPropertyId(propertyId: number): Observable<ApiResponse<UnitStats>> {
    return this.http.get<ApiResponse<UnitStats>>(`${BASE_URL}/properties/${propertyId}/units/stats`);
  }

  // ── PRIVATE ───────────────────────────────────────────────────────

  private buildParams(params?: UnitFilters & IQueryParam): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    const map: Record<string, any> = {
      page: params.page,
      per_page: params.perPage,
      search: params.search,
      property_id: params.property_id,
      status: params.status,
      unit_type_id: params.unit_type_id,
      is_active: params.is_active,
      is_primary: params.is_primary,
      floor: params.floor,
      min_rent: params.min_rent,
      max_rent: params.max_rent,
      min_surface: params.min_surface,
      max_surface: params.max_surface,
    };

    Object.entries(map).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }
}