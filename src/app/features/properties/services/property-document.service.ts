// services/property-document.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../shared/constants/app.constant';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { PropertyDocument } from '../models/property-document.model';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';
import { UploadPropertyDocumentPayload } from '../interfaces/upload-property-document-payload.interface';

export interface DocumentFilters {
  property_id?: number;
  type?: string;
  is_validated?: boolean;
  is_active?: boolean;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class PropertyDocumentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/documents`; // Shared base if applicable, or generic name

  // ── READ ──────────────────────────────────────────────────────────

  /**
   * Liste paginée des documents
   */
  findAll(params?: DocumentFilters & IQueryParam): Observable<PaginatedResponse<PropertyDocument>> {
    return this.http.get<PaginatedResponse<PropertyDocument>>(this.baseUrl, {
      params: this.buildParams(params),
    });
  }

  /**
   * Détail d'un document par ID
   */
  findById(id: number): Observable<ApiResponse<PropertyDocument>> {
    return this.http.get<ApiResponse<PropertyDocument>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Récupère tous les documents d'une entité (propriété ou structure)
   */
  findByOwner(
    ownerId: number,
    ownerType: 'properties' | 'structures',
    params?: IQueryParam,
  ): Observable<ApiResponse<PropertyDocument[]>> {
    return this.http.get<ApiResponse<PropertyDocument[]>>(
      `${BASE_URL}/${ownerType}/${ownerId}/documents`,
      { params: this.buildParams(params) },
    );
  }

  /**
   * Récupère les documents par type
   */
  findByType(
    propertyId: number,
    type: string,
    params?: IQueryParam,
  ): Observable<ApiResponse<PropertyDocument[]>> {
    return this.http.get<ApiResponse<PropertyDocument[]>>(
      `${BASE_URL}/properties/${propertyId}/documents/type/${type}`,
      { params: this.buildParams(params) },
    );
  }

  /**
   * Récupère les documents expirant bientôt
   */
  findExpiringSoon(days: number = 30): Observable<ApiResponse<PropertyDocument[]>> {
    return this.http.get<ApiResponse<PropertyDocument[]>>(`${this.baseUrl}/expiring-soon`, {
      params: { days: days.toString() },
    });
  }

  /**
   * Récupère les documents expirés
   */
  findExpired(): Observable<ApiResponse<PropertyDocument[]>> {
    return this.http.get<ApiResponse<PropertyDocument[]>>(`${this.baseUrl}/expired`);
  }

  // ── CREATE / UPLOAD ────────────────────────────────────────────────

  /**
   * Upload d'un document
   */
  upload(payload: UploadPropertyDocumentPayload): Observable<ApiResponse<PropertyDocument>> {
    const formData = new FormData();
    const endpoint = payload.property_id ? 'properties' : 'structures';
    
    if (payload.property_id) {
      formData.append('property_id', payload.property_id.toString());
    }
    if (payload.structure_id) {
      formData.append('structure_id', payload.structure_id.toString());
    }

    formData.append('type', payload.type);
    formData.append('title', payload.title);
    formData.append('document', payload.file); // Backend expects 'document'
    
    if (payload.description) {
      formData.append('description', payload.description);
    }
    if (payload.reference_number) {
      formData.append('reference_number', payload.reference_number);
    }
    if (payload.issue_date) {
      formData.append('issue_date', payload.issue_date);
    }
    if (payload.expiry_date) {
      formData.append('expiry_date', payload.expiry_date);
    }
    if (payload.is_public !== undefined) {
      formData.append('is_public', payload.is_public ? '1' : '0');
    }

    return this.http.post<ApiResponse<PropertyDocument>>(`${BASE_URL}/${endpoint}/documents`, formData);
  }

  // ── UPDATE ────────────────────────────────────────────────────────

  /**
   * Met à jour les métadonnées d'un document
   */
  update(id: number, data: Partial<PropertyDocument>): Observable<ApiResponse<PropertyDocument>> {
    return this.http.put<ApiResponse<PropertyDocument>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Valide un document (admin)
   */
  validate(
    id: number,
    isValidated: boolean,
    comment?: string,
  ): Observable<ApiResponse<PropertyDocument>> {
    return this.http.patch<ApiResponse<PropertyDocument>>(`${this.baseUrl}/${id}/validate`, {
      is_validated: isValidated,
      validation_comment: comment,
    });
  }

  // ── DELETE ────────────────────────────────────────────────────────

  /**
   * Suppression définitive d'un document
   */
  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Supprime tous les documents d'une propriété
   */
  deleteByPropertyId(propertyId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${BASE_URL}/properties/${propertyId}/documents`);
  }

  // ── DOWNLOAD ──────────────────────────────────────────────────────

  /**
   * Télécharge un fichier
   */
  download(id: number): Observable<Blob> {
    // Assuming a shared download endpoint, otherwise need context
    return this.http.get(`${BASE_URL}/documents/${id}/download`, {
      responseType: 'blob',
    });
  }

  /**
   * Ouvre un document dans un nouvel onglet
   */
  openDocument(id: number): void {
    this.download(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
      },
      error: () => {},
    });
  }

  // ── PRIVATE ───────────────────────────────────────────────────────

  private buildParams(params?: DocumentFilters & IQueryParam): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    const map: Record<string, string | number | boolean | null | undefined> = {
      page: params.page,
      per_page: params.perPage,
      search: params.search,
      property_id: params.property_id,
      type: params.type,
      is_validated: params.is_validated,
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