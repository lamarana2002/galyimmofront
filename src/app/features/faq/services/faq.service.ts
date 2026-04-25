import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BASE_URL } from '../../../shared/constants/app.constant';
import { FaqModel } from '../models/faq.model';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';
import { CreateFaqPayload, UpdateFaqPayload } from '../interfaces/faq-payload.interface';

@Injectable({ providedIn: 'root' })
export class FaqService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/faqs`;

  findAll(params?: IQueryParam & { search?: string }): Observable<PaginatedResponse<FaqModel>> {
    return this.http.get<PaginatedResponse<FaqModel>>(this.baseUrl, {
      params: this.buildParams(params),
    });
  }

  findById(id: number): Observable<ApiResponse<FaqModel>> {
    return this.http.get<ApiResponse<FaqModel>>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateFaqPayload): Observable<ApiResponse<FaqModel>> {
    return this.http.post<ApiResponse<FaqModel>>(this.baseUrl, payload);
  }

  update(payload: UpdateFaqPayload): Observable<ApiResponse<FaqModel>> {
    const { id, ...data } = payload;
    return this.http.put<ApiResponse<FaqModel>>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  private buildParams(params?: IQueryParam & { search?: string }): HttpParams {
    let p = new HttpParams();
    if (!params) return p;

    const map: Record<string, any> = {
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
