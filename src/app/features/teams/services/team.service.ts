import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { toFormDataIfNeeded } from '../../../shared/utils/form-data.utils';

import { BASE_URL } from '../../../shared/constants/app.constant';
import { TeamModel } from '../models/team.model';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';
import { CreateTeamPayload, UpdateTeamPayload } from '../interfaces/team-payload.interface';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/teams`;

  findAll(params?: IQueryParam & { search?: string }): Observable<PaginatedResponse<TeamModel>> {
    return this.http.get<PaginatedResponse<TeamModel>>(this.baseUrl, {
      params: this.buildParams(params),
    });
  }

  findById(id: number): Observable<ApiResponse<TeamModel>> {
    return this.http.get<ApiResponse<TeamModel>>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateTeamPayload): Observable<ApiResponse<TeamModel>> {
    return this.http.post<ApiResponse<TeamModel>>(this.baseUrl, toFormDataIfNeeded(payload));
  }

  update(payload: UpdateTeamPayload): Observable<ApiResponse<TeamModel>> {
    const { id, ...data } = payload;
    const body = toFormDataIfNeeded(data as Record<string, unknown>);

    if (body instanceof FormData) {
      body.append('_method', 'PUT');
      return this.http.post<ApiResponse<TeamModel>>(`${this.baseUrl}/${id}`, body);
    }

    return this.http.put<ApiResponse<TeamModel>>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
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
