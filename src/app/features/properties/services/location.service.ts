import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BASE_URL } from '../../../shared/constants/app.constant';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';
import { ILocationModel } from '../models/location.model';
import { CreateLocationPayload } from '../interfaces/create-location-payload.interface';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/locations`;

  create(payload: CreateLocationPayload): Observable<ApiResponse<ILocationModel>> {
    const form = new FormData();
    form.append('client', payload.client.toString());
    form.append('immeuble', payload.immeuble.toString());
    form.append('uniteLocation', payload.uniteLocation.toString());
    form.append('interval', payload.interval.toString());
    form.append('montant', payload.montant.toString());
    form.append('methodePayement', payload.methodePayement);
    form.append('date', payload.date);
    form.append('image', payload.image);

    return this.http.post<ApiResponse<ILocationModel>>(this.baseUrl, form);
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

  renew(id: number): Observable<ApiResponse<ILocationModel>> {
    return this.http.post<ApiResponse<ILocationModel>>(`${this.baseUrl}/${id}/renew`, {});
  }

  terminate(id: number): Observable<ApiResponse<ILocationModel>> {
    return this.http.post<ApiResponse<ILocationModel>>(`${this.baseUrl}/${id}/terminate`, {});
  }
}
