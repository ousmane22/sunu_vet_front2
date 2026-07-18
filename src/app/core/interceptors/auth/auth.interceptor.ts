import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  const router = inject(Router);

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        router.navigate(['/login']);
      }
      // Clinique désactivée ou abonnement expiré : déconnexion et redirection avec message
      if (error.status === 403 && (error.error?.code === 'business_disabled' || error.error?.code === 'subscription_expired')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        const code = error.error?.code === 'subscription_expired' ? 'subscriptionExpired' : 'businessDisabled';
        router.navigate(['/login'], { queryParams: { [code]: '1' } });
      }
      return throwError(() => error);
    })
  );
};


