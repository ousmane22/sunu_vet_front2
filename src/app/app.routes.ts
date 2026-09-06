import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth.guard';
import { businessGuard } from './core/guards/business/business.guard';
import { guestGuard } from './core/guards/guest/guest.guard';
import { superAdminGuard } from './core/guards/super-admin/super-admin.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Logiciel clinique vétérinaire tout-en-un',
    loadComponent: () => import('./features/landing/landing.component').then((m) => m.LandingComponent),
    data: {
      description: 'SunuVet est le logiciel de gestion de référence pour cliniques vétérinaires : consultations, animaux, vaccinations, stock, caisse et assistant IA. Essai gratuit 30 jours.',
    },
  },
  {
    path: 'demo',
    title: 'Démo interactive',
    loadComponent: () =>
      import('./features/landing/pages/demo/demo-page.component').then((m) => m.DemoPageComponent),
    data: {
      description: 'Testez la démo interactive de SunuVet sans inscription. Découvrez la gestion des dossiers animaux, ordonnances, stocks et caisse.',
    },
  },
  {
    path: 'faq',
    title: 'Foire aux Questions (FAQ)',
    loadComponent: () => import('./features/landing/pages/legal-page.component').then((m) => m.LegalPageComponent),
    data: {
      legalSlug: 'faq',
      description: 'Toutes les réponses à vos questions sur le logiciel SunuVet, les abonnements, la compatibilité PWA hors-ligne et l\'assistance vétérinaire.',
    },
  },
  {
    path: 'docs',
    title: 'Documentation & Guide d\'utilisation',
    loadComponent: () => import('./features/landing/pages/legal-page.component').then((m) => m.LegalPageComponent),
    data: {
      legalSlug: 'docs',
      description: 'Guide complet pour démarrer et configurer votre clinique vétérinaire sur SunuVet : paramétrage, stocks, tarifs et utilisateurs.',
    },
  },
  {
    path: 'privacy',
    title: 'Politique de Confidentialité',
    loadComponent: () => import('./features/landing/pages/legal-page.component').then((m) => m.LegalPageComponent),
    data: {
      legalSlug: 'privacy',
      description: 'Politique de protection des données personnelles et respect de la vie privée sur la plateforme SunuVet.',
    },
  },
  {
    path: 'terms',
    title: 'Conditions Générales d\'Utilisation (CGU)',
    loadComponent: () => import('./features/landing/pages/legal-page.component').then((m) => m.LegalPageComponent),
    data: {
      legalSlug: 'terms',
      description: 'Conditions générales d\'utilisation du service SaaS SunuVet pour les cliniques et cabinets vétérinaires.',
    },
  },
  {
    path: 'login',
    title: 'Connexion à votre espace clinique',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/components/login/login.component').then((m) => m.LoginComponent),
    data: {
      description: 'Connectez-vous à votre clinique SunuVet pour gérer vos consultations, animaux et ventes au quotidien.',
    },
  },
  {
    path: 'register',
    title: 'Créer votre compte clinique — Essai 30 jours gratuit',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/components/register/register.component').then((m) => m.RegisterComponent),
    data: {
      description: 'Inscrivez votre clinique vétérinaire sur SunuVet en 2 minutes. Bénéficiez de 30 jours d\'essai gratuit sans engagement.',
    },
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
