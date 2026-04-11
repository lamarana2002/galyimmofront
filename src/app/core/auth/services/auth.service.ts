import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { RegisterPayload } from '../interfaces/register-payload.interface';
import { BASE_URL } from '../../../shared/constants/app.constant';
import { AuthUser } from '../interfaces/auth-user.interface';

// Helpers calculés côté Angular (non stockés)
export function getUserFullName(u: AuthUser): string {
  return `${u.prenom} ${u.nom}`.trim();
}

export function getUserInitials(u: AuthUser): string {
  return `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase();
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface RegisterFiles {
  avatar?: File;
  cover?: File;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

// ── Clés localStorage ─────────────────────────────────────────────
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = BASE_URL;

  // ── Signals (état réactif) ─────────────────────────────────────
  private _user = signal<AuthUser | null>(this.loadUserFromStorage());
  private _loading = signal<boolean>(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();

  // ── Computed ───────────────────────────────────────────────────
  readonly isLoggedIn = computed(() => !!this._user());
  readonly isSuperAdmin = this.createRoleCheck('super-admin');
  readonly isOwner = this.createRoleCheck('proprietaire');
  readonly isEmployee = this.createRoleCheck('gestionnaire');
  readonly isAgent = this.createRoleCheck('agent');

  readonly userRoles = computed(() => this._user()?.roles.map((r) => r.name) ?? []);
  readonly userPermissions = computed(() => {
    const roles = this._user()?.roles ?? [];
    const permissions = new Set<string>();
    roles.forEach((r) => {
      r.permissions?.forEach((p) => permissions.add(p.name));
    });
    return Array.from(permissions);
  });
  // email_verified_at (snake_case — champ réel de la migration)
  readonly emailVerified = computed(() => !!this._user()?.email_verified_at);
  // hasStructure : structure_id non null
  readonly hasStructure = computed(() => !!this._user()?.structure_id);
  readonly fullName = computed(() => {
    const u = this._user();
    return u ? `${u.prenom} ${u.nom}`.trim() : '';
  });
  readonly initials = computed(() => {
    const u = this._user();
    return u ? `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase() : '';
  });
  readonly avatarUrl = computed(() => {
    const avatar = this._user()?.avatar ?? 'avatar.png';
    // Si c'est déjà une URL complète, on la retourne telle quelle
    if (avatar.startsWith('http')) return avatar;
    return `/storage/${avatar}`;
  });

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  // ── Login ──────────────────────────────────────────────────────
  login(payload: LoginPayload): Observable<AuthResponse> {
    Object.assign(payload, { device_name: 'web' });
    this._loading.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((res) => {
        this.saveSession(res);
        this._loading.set(false);
        this.redirectAfterLogin(res.user);
      }),
      catchError((err) => {
        this._loading.set(false);
        return throwError(() => err);
      }),
    );
  }

  // ── Register ───────────────────────────────────────────────────
  register(payload: RegisterPayload, files?: RegisterFiles): Observable<AuthResponse> {
    this._loading.set(true);

    // FormData obligatoire à cause des fichiers avatar/cover
    const fd = new FormData();
    Object.entries(payload.structure).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        fd.append(`structure[${k}]`, String(v));
      }
    });
    Object.entries(payload.user).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        fd.append(`user[${k}]`, String(v));
      }
    });
    if (files?.avatar) fd.append('avatar', files.avatar);
    if (files?.cover) fd.append('cover', files.cover);

    return this.http.post<AuthResponse>(`${this.apiUrl}/inscription`, fd).pipe(
      tap((res) => {
        this.saveSession(res);
        this._loading.set(false);
        // this.router.navigate(['/auth/verify-email']);
        this.router.navigate(['/auth/login']);
      }),
      catchError((err) => {
        this._loading.set(false);
        return throwError(() => err);
      }),
    );
  }

  // ── Logout ─────────────────────────────────────────────────────
  logout(): void {
    // Appel API pour révoquer le token côté serveur (fire & forget)
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({ error: () => {} });
    }
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  // ── Forgot password ────────────────────────────────────────────
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  // ── Reset password ─────────────────────────────────────────────
  resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, payload);
  }

  // ── Verify email ───────────────────────────────────────────────
  verifyEmail(
    id: string,
    hash: string,
    expires: string,
    signature: string,
  ): Observable<{ message: string }> {
    return this.http
      .get<{
        message: string;
      }>(`/api/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`)
      .pipe(
        tap(() => {
          const u = this._user();
          if (u) {
            const updated = { ...u, emailVerifiedAt: new Date().toISOString() };
            this._user.set(updated);
            localStorage.setItem(USER_KEY, JSON.stringify(updated));
            this.redirectAfterLogin(updated);
          }
        }),
      );
  }

  // ── Resend verification email ──────────────────────────────────
  resendVerification(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/email/verification-notification', {});
  }

  // ── Refresh user from API ──────────────────────────────────────
  refreshUser(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this._user.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }),
    );
  }

  // ── Token ──────────────────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ── Redirect selon rôle ────────────────────────────────────────
  redirectAfterLogin(user: AuthUser): void {
    // if (!user.email_verified_at) {
    //   this.router.navigate(['/auth/verify-email']);
    //   return;
    // }

    const roleNames = user.roles?.map(r => r.name) ?? [];

    // Priorité : super-admin > proprietaire > gestionnaire > agent
    if (roleNames.includes('super-admin')) {
      this.router.navigate(['/structures']);
    } else if (roleNames.includes('proprietaire')) {
      if (!user.structure_id) {
        this.router.navigate(['/auth/login']);
      } else {
        this.router.navigate(['/properties']);
      }
    } else if (roleNames.includes('gestionnaire') || roleNames.includes('agent')) {
      this.router.navigate(['/properties']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  // ── Vérifications Rôles & Permissions ──────────────────────────
  hasRole(roleName: string): boolean {
    return this.userRoles().includes(roleName);
  }

  hasAnyRole(roleNames: string[]): boolean {
    return roleNames.some(role => this.hasRole(role));
  }

  hasPermission(permissionName: string): boolean {
    return this.userPermissions().includes(permissionName);
  }

  hasAnyPermission(permissionNames: string[]): boolean {
    return permissionNames.some(perm => this.hasPermission(perm));
  }

  // ── Session helpers ────────────────────────────────────────────
  private saveSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._user.set(res.user);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private createRoleCheck(roleName: string) {
    return computed(() => {
      const user = this._user();
      return user ? user.roles.some((role) => role.name === roleName) : false;
    });
  }
}
