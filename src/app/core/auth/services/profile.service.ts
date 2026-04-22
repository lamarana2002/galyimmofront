import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BASE_URL } from '../../../shared/constants/app.constant';
import { AuthUser } from '../interfaces/auth-user.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { UpdateProfilePayload } from '../interfaces/update-profile-payload.interface';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private authService = inject(AuthService);

  readonly currentUser = this.authService.user;
  private http = inject(HttpClient);
  private readonly apiUrl = BASE_URL;

  get roleNamesArray(): string[] {
    const roles = this.currentUser()?.roles;
    if (!roles) return [];
    return roles.map((r) => r.name);
  }
  get roleNames(): string {
    const roles = this.currentUser()?.roles;
    if (!roles) return 'aucun role';
    return roles.map((r) => r.name).join('|');
  }
  get isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }
  get isOwner(): boolean {
    return this.authService.isOwner();
  }
  get isEmployee(): boolean {
    return this.authService.isEmployee();
  }
  get userStructure(): number | null | undefined {
    return this.currentUser()?.structure_id;
  }

  // ── API Actions ────────────────────────────────────────────────
  update(payload: UpdateProfilePayload): Observable<ApiResponse<AuthUser>> {
    const body = this.toFormDataIfNeeded(payload);

    if (body instanceof FormData) {
      // Laravel expects POST with _method=PUT for multipart requests with files
      body.append('_method', 'PUT');
      return this.http.post<ApiResponse<AuthUser>>(`${this.apiUrl}/profile`, body).pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.authService.updateUser(res.data);
          }
        })
      );
    }

    return this.http.put<ApiResponse<AuthUser>>(`${this.apiUrl}/profile`, body).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.authService.updateUser(res.data);
        }
      })
    );
  }

  updatePassword(payload: any): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/profile/password`, payload);
  }

  // ── Private Helpers ────────────────────────────────────────────

  private toFormDataIfNeeded(payload: UpdateProfilePayload): FormData | UpdateProfilePayload {
    const hasFile = payload.avatar instanceof File;
    if (!hasFile) return payload;

    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value instanceof File) {
        form.append(key, value);
      } else if (value !== undefined && value !== null) {
        form.append(key, value.toString());
      }
    });

    return form;
  }
}
