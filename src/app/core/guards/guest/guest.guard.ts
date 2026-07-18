import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      const roles = user?.roles ?? [];
      const isSuperAdmin = Array.isArray(roles) && roles.some((r: string) => r === 'super-admin' || r === 'super_admin');
      if (isSuperAdmin) {
        return router.createUrlTree(['/super-admin']);
      }
      // Déjà connecté avec une entreprise : aller au tableau de bord (évite boucle sur la landing)
      if (user?.business_id) {
        return router.createUrlTree(['/business', 'dashboard']);
      }
      return router.createUrlTree(['/']);
    } catch (e) {
      // Ignore parse errors, just let them access login
    }
  }

  return true;
};


