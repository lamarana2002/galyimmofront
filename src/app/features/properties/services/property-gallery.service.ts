// services/property-gallery.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../shared/constants/app.constant';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';
import { PropertyGallery } from '../models/property-gallery.model';
import { GalleryImage } from '../pages/location-unit/location-unit';
import { CreatePropertyGalleryPayload } from '../interfaces/create-property-gallery-payload.interface';
import { UpdatePropertyGalleryPayload } from '../interfaces/update-propertyy-gallery-payload.interface';

export interface GalleryFilters {
  property_id?: number;
  is_active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PropertyGalleryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/gallery`;

  // ── READ ──────────────────────────────────────────────────────────

  /**
   * Liste paginée des images de la galerie
   */
  findAll(params?: GalleryFilters & IQueryParam): Observable<PaginatedResponse<PropertyGallery>> {
    return this.http.get<PaginatedResponse<PropertyGallery>>(this.baseUrl, {
      params: this.buildParams(params),
    });
  }

  /**
   * Détail d'une image par ID
   */
  findById(id: number): Observable<ApiResponse<PropertyGallery>> {
    return this.http.get<ApiResponse<PropertyGallery>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Récupère toutes les images d'une propriété spécifique
   */
  findByPropertyId(
    propertyId: number,
    params?: IQueryParam,
  ): Observable<ApiResponse<PropertyGallery[]>> {
    return this.http.get<ApiResponse<PropertyGallery[]>>(
      `${BASE_URL}/properties/${propertyId}/gallery`,
      { params: this.buildParams(params) },
    );
  }

  /**
   * Récupère l'image principale d'une propriété (celle avec ordre = 1 ou la première)
   */
  findMainByPropertyId(propertyId: number): Observable<ApiResponse<PropertyGallery>> {
    return this.http.get<ApiResponse<PropertyGallery>>(
      `${BASE_URL}/properties/${propertyId}/gallery/main`,
    );
  }

  // ── CREATE / UPLOAD ────────────────────────────────────────────────

  /**
   * Upload d'une seule image
   */
  upload(file: File, propertyId: number, caption?: string): Observable<ApiResponse<PropertyGallery>> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('property_id', propertyId.toString());
    if (caption) {
      formData.append('caption', caption);
    }

    return this.http.post<ApiResponse<PropertyGallery>>(`${this.baseUrl}`, formData);
  }

  /**
   * Upload de plusieurs images en une seule requête
   */
  uploadMultiple(files: File[], propertyId: number): Observable<ApiResponse<PropertyGallery[]>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    formData.append('property_id', propertyId.toString());

    return this.http.post<ApiResponse<PropertyGallery[]>>(`${this.baseUrl}/upload-multiple`, formData);
  }

  /**
   * Crée une entrée galerie sans fichier (si l'image est déjà uploadée ailleurs)
   */
  create(payload: CreatePropertyGalleryPayload & { path: string }): Observable<ApiResponse<PropertyGallery>> {
    return this.http.post<ApiResponse<PropertyGallery>>(this.baseUrl, payload);
  }

  // ── UPDATE ────────────────────────────────────────────────────────

  /**
   * Met à jour les métadonnées d'une image (caption, ordre)
   */
  update(payload: UpdatePropertyGalleryPayload): Observable<ApiResponse<PropertyGallery>> {
    const { id, ...data } = payload;
    return this.http.put<ApiResponse<PropertyGallery>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Met à jour l'ordre d'une image
   */
  updateOrder(id: number, ordre: number): Observable<ApiResponse<PropertyGallery>> {
    return this.http.patch<ApiResponse<PropertyGallery>>(`${this.baseUrl}/${id}/order`, { ordre });
  }

  /**
   * Réordonne toutes les images d'une propriété
   */
  reorder(propertyId: number, orderedIds: number[]): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${BASE_URL}/properties/${propertyId}/gallery/reorder`,
      { ordered_ids: orderedIds },
    );
  }

  /**
   * Définit une image comme image principale
   */
  setAsMain(id: number, propertyId: number): Observable<ApiResponse<GalleryImage>> {
    return this.http.post<ApiResponse<GalleryImage>>(`${this.baseUrl}/${id}/set-main`, {
      property_id: propertyId,
    });
  }

  // ── DELETE ────────────────────────────────────────────────────────

  /**
   * Suppression définitive d'une image
   */
  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Supprime toutes les images d'une propriété
   */
  deleteByPropertyId(propertyId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${BASE_URL}/properties/${propertyId}/gallery`);
  }

  // ── PRIVATE ───────────────────────────────────────────────────────

  private buildParams(params?: GalleryFilters & IQueryParam): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    const map: Record<string, any> = {
      page: params.page,
      per_page: params.perPage,
      search: params.search,
      property_id: params.property_id,
      is_active: params.is_active,
    };

    Object.entries(map).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }
}