import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

/** Rôles reconnus comme super-admin (backend peut renvoyer tiret ou underscore). */
const SUPER_ADMIN_ROLES = ['super-admin', 'super_admin'];

function hasSuperAdminRole(roles: unknown): boolean {
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => SUPER_ADMIN_ROLES.includes(String(r)));
}

/**
 * Guard qui restreint l'accès aux routes /super-admin aux seuls utilisateurs
 * ayant le rôle "super-admin". Doit être utilisé après authGuard.
 */
export const superAdminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');

  if (!token || !userStr) {
    return router.createUrlTree(['/login']);
  }

  try {
    const user = JSON.parse(userStr);
    if (hasSuperAdminRole(user?.roles)) {
      return true;
    }

    // Utilisateur connecté mais pas super-admin : redirection vers business ou accueil
    return router.createUrlTree(['/business']);
  } catch {
    return router.createUrlTree(['/login']);
  }
};


