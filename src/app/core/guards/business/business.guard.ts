import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

/**
 * Guard qui restreint l'accès aux routes /business aux seuls utilisateurs
 * ayant une clinique (business_id). À utiliser après authGuard.
 * Les super-admin (sans business_id) sont redirigés vers /super-admin.
 */
export const businessGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userStr = localStorage.getItem('auth_user');

  if (!userStr) {
    return router.createUrlTree(['/login']);
  }

  try {
    const user = JSON.parse(userStr) as { business_id?: number | null; roles?: string[] };
    const hasBusiness = user?.business_id != null;

    if (hasBusiness) {
      return true;
    }

    // Utilisateur connecté sans clinique (ex. super-admin) → redirection vers super-admin
    const isSuperAdmin = Array.isArray(user?.roles) &&
      user.roles.some((r: string) => r === 'super-admin' || r === 'super_admin');
    if (isSuperAdmin) {
      return router.createUrlTree(['/super-admin']);
    }

    return router.createUrlTree(['/']);
  } catch {
    return router.createUrlTree(['/login']);
  }
};


