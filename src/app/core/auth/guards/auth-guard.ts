import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// ── Guard 1 : utilisateur connecté ? ──────────────────────────────
export const authGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
  return true;
};

// ── Guard 2 : email vérifié ? ─────────────────────────────────────
export const emailVerifiedGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.emailVerified()) {
    router.navigate(['/auth/verify-email']);
    return false;
  }
  return true;
};

// ── Guard 3 : rôle autorisé ? ─────────────────────────────────────
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (!auth.hasAnyRole(allowedRoles)) {
      router.navigate(['/403']);
      return false;
    }
    return true;
  };
};

// ── Guard 3 bis : permission autorisée ? ──────────────────────────
export const permissionGuard = (allowedPermissions: string[]): CanActivateFn => {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (!auth.hasAnyPermission(allowedPermissions)) {
      router.navigate(['/403']);
      return false;
    }
    return true;
  };
};

// ── Guard 4 : rediriger si déjà connecté (pages auth) ─────────────
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    auth.redirectAfterLogin(auth.user()!);
    return false;
  }
  return true;
};

// ── Guard 5 : structure créée ? (owner seulement) ─────────────────
export const hasStructureGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isOwner() && !auth.hasStructure()) {
    router.navigate(['/auth/onboarding']);
    return false;
  }
  return true;
};