import { toFormDataIfNeeded } from '../../../shared/utils/form-data.utils';
import { BASE_URL } from '../../../shared/constants/app.constant';
import { TestimonialModel } from '../models/testimonial.model';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';
import { CreateTestimonialPayload, UpdateTestimonialPayload } from '../interfaces/testimonial-payload.interface';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

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
    const body = toFormDataIfNeeded(payload as Record<string, any>);
    return this.http.post<ApiResponse<TestimonialModel>>(this.baseUrl, body);
  }

  update(payload: UpdateTestimonialPayload): Observable<ApiResponse<TestimonialModel>> {
    const { id, ...data } = payload;
    const body = toFormDataIfNeeded(data as Record<string, any>);
    
    if (body instanceof FormData) {
      body.append('_method', 'PUT');
      return this.http.post<ApiResponse<TestimonialModel>>(`${this.baseUrl}/${id}`, body);
    }
    
    return this.http.put<ApiResponse<TestimonialModel>>(`${this.baseUrl}/${id}`, body);
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
