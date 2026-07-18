import { Routes } from '@angular/router';
import { SuperAdminLayoutComponent } from './layout/super-admin-layout/super-admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    title: 'Administration',
    component: SuperAdminLayoutComponent,
    children: [
      {
        path: '',
        title: 'Vue d’ensemble',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'businesses',
        title: 'Entreprises',
        loadComponent: () =>
          import('./businesses/business-list/business-list.component').then((m) => m.BusinessListComponent),
      },
      {
        path: 'businesses/:id',
        title: 'Détail entreprise',
        loadComponent: () =>
          import('./businesses/business-detail/business-detail.component').then(
            (m) => m.BusinessDetailComponent
          ),
      },
      {
        path: 'business-admins',
        title: 'Administrateurs entreprise',
        loadComponent: () =>
          import('./business-admins/business-admins.component').then((m) => m.BusinessAdminsComponent),
      },
      {
        path: 'revenue',
        title: 'Revenus',
        loadComponent: () => import('./revenue/revenue.component').then((m) => m.RevenueComponent),
      },
      {
        path: 'settings',
        title: 'Paramètres',
        loadComponent: () => import('./settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: '**',
        title: 'Page introuvable',
        loadComponent: () =>
          import('./errors/admin-not-found/admin-not-found.component').then((m) => m.AdminNotFoundComponent),
      },
    ],
  },
];
