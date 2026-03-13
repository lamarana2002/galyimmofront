// structure.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { StructureModel } from '../models/structure.model';
import { StructureStatus } from '../enums/structure-status.enum';
import { StructurePlanType } from '../enums/structure-plan-type.enum';
import { StructureStats } from '../models/structure-stats.model';
import { FilterStructure } from '../interfaces/filter-structure.interface';

import { BASE_URL } from '../../../shared/constants/app.constant';
import { IQueryParam } from '../../../shared/interfaces/query-parms.interface';
import { PaginatedResponse } from '../../../shared/interfaces/paginated-response.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';

@Injectable({ providedIn: 'root' })
export class StructureService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL}/structures`;

  // ======================== READ ========================

  /**
   * Récupère la liste paginée des structures
   */
  findAll(queryParams?: IQueryParam): Observable<PaginatedResponse<StructureModel>> {
    let params = new HttpParams();

    if (queryParams?.page) {
      params = params.set('page', queryParams.page.toString());
    }
    if (queryParams?.perPage) {
      params = params.set('per_page', queryParams.perPage.toString());
    }
    // if (queryParams?.search) {
    //   params = params.set('search', queryParams.search);
    // }
    // if (queryParams?.status) {
    //   params = params.set('status', queryParams.status);
    // }
    // if (queryParams?.plan) {
    //   params = params.set('plan', queryParams.plan);
    // }

    return this.http.get<PaginatedResponse<StructureModel>>(this.baseUrl, { params });
  }

  /**
   * Récupère une structure par son ID
   */
  findById(id: number): Observable<ApiResponse<StructureModel>> {
    return this.http.get<ApiResponse<StructureModel>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Récupère les statistiques globales des structures
   */
  getStats(): Observable<StructureStats> {
    return this.http.get<StructureStats>(`${this.baseUrl}/stats`);
  }

  // ======================== CREATE ========================

  /**
   * Crée une nouvelle structure
   */
  create(data: Partial<StructureModel>): Observable<ApiResponse<StructureModel>> {
    return this.http.post<ApiResponse<StructureModel>>(this.baseUrl, data);
  }

  // ======================== UPDATE ========================

  /**
   * Met à jour une structure existante
   */
  update(id: number, data: Partial<StructureModel>): Observable<ApiResponse<StructureModel>> {
    return this.http.put<ApiResponse<StructureModel>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Change le statut d'une structure
   */
  changeStatus(structureId: number, status: StructureStatus): Observable<ApiResponse<StructureModel>> {
    return this.http.put<ApiResponse<StructureModel>>(
      `${this.baseUrl}/${structureId}/status`,
      { status }
    ).pipe(
      tap(response => console.log('✅ Statut modifié:', response))
    );
  }

  /**
   * Change le plan d'une structure (Freemium ↔ Premium)
   */
  changePlan(structureId: number): Observable<ApiResponse<StructureModel>> {
    return this.http.put<ApiResponse<StructureModel>>(
      `${this.baseUrl}/${structureId}/plan`,
      {}
    ).pipe(
      tap(response => console.log('✅ Plan modifié:', response))
    );
  }

  // ======================== DELETE ========================

  /**
   * Supprime définitivement une structure
   */
  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Supprime plusieurs structures (batch delete)
   */
  deleteMany(ids: number[]): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/batch-delete`, { ids });
  }

  /**
   * Archive une structure (soft delete)
   */
  archive(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}/archive`);
  }

  /**
   * Restaure une structure archivée
   */
  restore(id: number): Observable<ApiResponse<StructureModel>> {
    return this.http.post<ApiResponse<StructureModel>>(`${this.baseUrl}/${id}/restore`, {});
  }

  // ======================== UTILS ========================

  /**
   * Formate le nom complet du propriétaire
   */
  getOwnerName(nom?: string, prenom?: string): string {
    return `${prenom ?? ''} ${nom ?? ''}`.trim() || 'Propriétaire inconnu';
  }

  /**
   * Récupère les initiales d'un nom
   */
  getInitials(name: string): string {
    if (!name?.trim()) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  /**
   * Calcule le score de santé d'une structure (0-100)
   */
  getHealthScore(structure: StructureModel): number {
    // Cas particuliers
    if (structure.status === StructureStatus.SUSPENDED || 
        structure.status === StructureStatus.REJECTED) {
      return 10;
    }

    const stats = structure.stats ?? { employes: 0, biens: 0, locations: 0 };
    
    // Formule : occupation (60%) + biens (20%) + équipe (20%)
    const occupation = stats.biens > 0 ? (stats.locations / stats.biens) * 60 : 0;
    const biensScore = (Math.min(20, stats.biens) / 20) * 20;
    const equipeScore = (Math.min(10, stats.employes) / 10) * 20;
    
    return Math.round(Math.max(10, occupation + biensScore + equipeScore));
  }

  /**
   * Retourne le label d'un statut
   */
  getStatutLabel(status: string): string {
    const map: Record<string, string> = {
      [StructureStatus.APPROUVED]: 'Approuvée',
      [StructureStatus.REJECTED]: 'Rejetée',
      [StructureStatus.PENDING]: 'En attente',
      [StructureStatus.SUSPENDED]: 'Suspendue',
    };
    return map[status] ?? status;
  }

  /**
   * Retourne la couleur associée à un statut (pour badges)
   */
  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      [StructureStatus.APPROUVED]: 'bg-green-100 text-green-700 border-green-200',
      [StructureStatus.PENDING]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      [StructureStatus.REJECTED]: 'bg-red-100 text-red-700 border-red-200',
      [StructureStatus.SUSPENDED]: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  }

  /**
   * Retourne la couleur associée à un plan
   */
  getPlanColor(plan: string): string {
    const map: Record<string, string> = {
      [StructurePlanType.PREMIUM]: 'bg-secondary-100 text-secondary-700 border-secondary-200',
      [StructurePlanType.FREEMIUM]: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return map[plan] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  }

  /**
   * Vérifie si une transition de statut est autorisée
   */
  isStatusTransitionAllowed(currentStatus: string, newStatus: string): boolean {
    const rules: Record<string, string[]> = {
      [StructureStatus.PENDING]: [StructureStatus.APPROUVED, StructureStatus.REJECTED],
      [StructureStatus.REJECTED]: [StructureStatus.APPROUVED],
      [StructureStatus.APPROUVED]: [StructureStatus.SUSPENDED],
      [StructureStatus.SUSPENDED]: [StructureStatus.APPROUVED],
    };

    const allowed = rules[currentStatus] ?? [];
    return allowed.includes(newStatus);
  }
}