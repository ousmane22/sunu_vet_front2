import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth.guard';
import { businessGuard } from './core/guards/business/business.guard';
import { guestGuard } from './core/guards/guest/guest.guard';
import { superAdminGuard } from './core/guards/super-admin/super-admin.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Sunu Vet',
    loadComponent: () => import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    title: 'Connexion',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    title: 'Inscription',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/components/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'profile',
    title: 'Mon profil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/user-profile/user-profile.component').then((m) => m.UserProfileComponent),
  },
  {
    path: 'super-admin',
    canActivate: [authGuard, superAdminGuard],
    canActivateChild: [authGuard, superAdminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'business',
    canActivate: [authGuard, businessGuard],
    canActivateChild: [authGuard, businessGuard],
    loadChildren: () => import('./features/business/business.routes').then((m) => m.BUSINESS_ROUTES),
  },
  {
    path: '**',
    title: 'Page introuvable',
    loadComponent: () =>
      import('./features/errors/page-not-found/page-not-found.component').then((m) => m.PageNotFoundComponent),
  },
];
