import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BASE_URL } from '../../../shared/constants/app.constant';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';
import { ILocationModel } from '../models/location.model';
import { CreateLocationPayload } from '../interfaces/create-location-payload.interface';
import { RenewLocationPayload } from '../interfaces/renew-location-payload.interface';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/locations`;

  create(payload: CreateLocationPayload): Observable<ApiResponse<ILocationModel>> {
    return this.http.post<ApiResponse<ILocationModel>>(this.baseUrl, payload);
  }

  findAll(params?: IQueryParam): Observable<PaginatedResponse<ILocationModel>> {
    let httpParams = new HttpParams();
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.perPage) {
      httpParams = httpParams.set('per_page', params.perPage.toString());
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<PaginatedResponse<ILocationModel>>(this.baseUrl, {
      params: httpParams,
    });
  }

  renew(id: number, payload: RenewLocationPayload): Observable<ApiResponse<ILocationModel>> {
    return this.http.post<ApiResponse<ILocationModel>>(`${this.baseUrl}/${id}/renew`, payload);
  }

  terminate(id: number): Observable<ApiResponse<ILocationModel>> {
    return this.http.post<ApiResponse<ILocationModel>>(`${this.baseUrl}/${id}/terminate`, {});
  }
}
