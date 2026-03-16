import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private authService = inject(AuthService);

  get currentUser() {
    return this.authService.user();
  }
  get roleNamesArray(): string[] {
    const roles = this.currentUser?.roles;
    if (!roles) return [];
    return roles.map((r) => r.name);
  }
  get roleNames(): string {
    const roles = this.currentUser?.roles;
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
}
