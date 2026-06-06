import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../shared/constants/app.constant';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import {
  Facture,
  FacturePayment,
  FactureListResponse,
  AddPaymentToFacturePayload,
} from '../models/facture.model';

@Injectable({ providedIn: 'root' })
export class FactureService {
  private http = inject(HttpClient);
  private baseUrl = `${BASE_URL}/factures`;

  getByLocation(locationId: number): Observable<FactureListResponse> {
    const params = new HttpParams()
      .set('location_id', locationId.toString())
      .set('per_page', '50');
    return this.http.get<FactureListResponse>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<Facture>> {
    return this.http.get<ApiResponse<Facture>>(`${this.baseUrl}/${id}`);
  }

  addPayment(
    factureId: number,
    payload: AddPaymentToFacturePayload
  ): Observable<ApiResponse<FacturePayment>> {
    return this.http.post<ApiResponse<FacturePayment>>(
      `${this.baseUrl}/${factureId}/payments`,
      payload
    );
  }
}
