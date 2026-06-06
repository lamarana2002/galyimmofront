import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment, CreatePaymentPayload, PaymentStatus } from '../models/payment.model';
import { BASE_URL } from '../../../shared/constants/app.constant';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${BASE_URL}/factures`;

  getAllPayments(params?: IQueryParam & { search?: string }): Observable<PaginatedResponse<Payment>> {
    return this.http.get<PaginatedResponse<Payment>>(this.apiUrl, { params: this.buildParams(params) });
  }

  createPayment(payload: CreatePaymentPayload): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(this.apiUrl, payload);
  }

  updateStatus(id: string, status: PaymentStatus): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/${id}/status`, { status });
  }

  private buildParams(params?: IQueryParam & { search?: string }): HttpParams {
    let p = new HttpParams();
    if (!params) return p;

    const map: Record<string, string | number | null | undefined> = {
      page: params.page,
      per_page: params.perPage,
      search: params.search,
    };

    Object.entries(map).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, value.toString());
      }
    });

    return p;
  }
}
