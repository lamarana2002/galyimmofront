import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BASE_URL } from '../../../shared/constants/app.constant';
import { TestimonialModel } from '../models/testimonial.model';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';
import { CreateTestimonialPayload, UpdateTestimonialPayload } from '../interfaces/testimonial-payload.interface';

@Injectable({ providedIn: 'root' })
export class TestimonialService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/testimonials`;

  findAll(params?: IQueryParam & { search?: string }): Observable<PaginatedResponse<TestimonialModel>> {
    return this.http.get<PaginatedResponse<TestimonialModel>>(this.baseUrl, {
      params: this.buildParams(params),
    });
  }

  findById(id: number): Observable<ApiResponse<TestimonialModel>> {
    return this.http.get<ApiResponse<TestimonialModel>>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateTestimonialPayload): Observable<ApiResponse<TestimonialModel>> {
    return this.http.post<ApiResponse<TestimonialModel>>(this.baseUrl, payload);
  }

  update(payload: UpdateTestimonialPayload): Observable<ApiResponse<TestimonialModel>> {
    const { id, ...data } = payload;
    return this.http.put<ApiResponse<TestimonialModel>>(`${this.baseUrl}/${id}`, data);
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
