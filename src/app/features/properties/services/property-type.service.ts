import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PropertyTypeModel } from '../models/propety-type.model';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../shared/constants/app.constant';

@Injectable({ providedIn: 'root' })
export class PropertyTypeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/properties/types`;

  // ── READ ──────────────────────────────────────────────────────────

  /**
   * Liste des types de propriete
   */
  findAll(): Observable<PropertyTypeModel[]> {
    return this.http.get<PropertyTypeModel[]>(this.baseUrl);
  }
}
