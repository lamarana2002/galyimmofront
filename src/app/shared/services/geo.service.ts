import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../constants/app.constant';
import { ApiResponse } from '../interfaces/api-response.interface';
import { ICountry, IRegion, IVille, ICommune, IQuartier, ISquareArea, IAdresse } from '../models/adresse.model';

@Injectable({ providedIn: 'root' })
export class GeoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/geographie`;

  getCountries(): Observable<ApiResponse<ICountry[]>> {
    return this.http.get<ApiResponse<ICountry[]>>(`${this.baseUrl}/countries`);
  }

  getRegions(countryId: number): Observable<ApiResponse<IRegion[]>> {
    return this.http.get<ApiResponse<IRegion[]>>(`${this.baseUrl}/countries/${countryId}/regions`);
  }

  getVilles(regionId: number): Observable<ApiResponse<IVille[]>> {
    return this.http.get<ApiResponse<IVille[]>>(`${this.baseUrl}/regions/${regionId}/villes`);
  }

  getCommunes(villeId: number): Observable<ApiResponse<ICommune[]>> {
    return this.http.get<ApiResponse<ICommune[]>>(`${this.baseUrl}/villes/${villeId}/communes`);
  }

  getQuartiers(communeId: number): Observable<ApiResponse<IQuartier[]>> {
    return this.http.get<ApiResponse<IQuartier[]>>(`${this.baseUrl}/communes/${communeId}/quartiers`);
  }

  getSquareAreas(quartierId: number): Observable<ApiResponse<ISquareArea[]>> {
    return this.http.get<ApiResponse<ISquareArea[]>>(`${this.baseUrl}/quartiers/${quartierId}/square-areas`);
  }

  getAdresses(squareAreaId: number): Observable<ApiResponse<IAdresse[]>> {
    return this.http.get<ApiResponse<IAdresse[]>>(`${this.baseUrl}/adresses/${squareAreaId}/square-areas`);
  }
}
