import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  const token = authService.getToken();

  // Injecter le token si présent
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Token expiré ou invalide → déconnexion forcée
      if (err.status === 401) {
        authService.logout();
        router.navigate(['/auth/login'], {
          queryParams: { reason: 'session_expired' }
        });
      }
      // Accès refusé
      if (err.status === 403) {
        router.navigate(['/403']);
      }
      return throwError(() => err);
    })
  );
};