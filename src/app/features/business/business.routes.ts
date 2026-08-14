import { Routes } from '@angular/router';
import { requireOpenRegisterGuard } from '../../core/guards/business/require-open-register.guard';

/**
 * Ordre important : routes statiques et segments littéraux avant les paramètres
 * (ex. `quotes/new` avant `quotes/:id/edit` pour éviter que :id ne capture « new »).
 */
export const BUSINESS_ROUTES: Routes = [
  {
    path: '',
    title: 'Espace clinique',
    loadComponent: () =>
      import('./layout/business-layout/business-layout.component').then(
        (m) => m.BusinessLayoutComponent
      ),
    children: [
      {
        path: 'dashboard',
        title: 'Tableau de bord',
        loadComponent: () =>
          import('./dashboard/business-dashboard/business-dashboard.component').then(
            (m) => m.BusinessDashboardComponent
          ),
      },
      {
        path: 'pos',
        title: 'Point de vente',
        loadComponent: () =>
          import('./pos/pos-page/pos-page.component').then((m) => m.PosPageComponent),
      },
      {
        path: 'products',
        title: 'Médicaments',
        loadComponent: () =>
          import('./products/product-list/product-list.component').then(
            (m) => m.ProductListComponent
          ),
      },
      {
        path: 'categories',
        title: 'Catégories',
        loadComponent: () =>
          import('./products/category-list/category-list.component').then(
            (m) => m.CategoryListComponent
          ),
      },
      {
        path: 'stock-movements',
        title: 'Mouvements de stock',
        loadComponent: () =>
          import('./stock-movements-page/stock-movements-page.component').then(
            (m) => m.StockMovementsPageComponent
          ),
      },
      {
        path: 'stock-report',
        title: 'Rapport de stock',
        loadComponent: () =>
          import('./stock-report/stock-report-page.component').then((m) => m.StockReportPageComponent),
      },
      {
        path: 'inventory',
        redirectTo: 'stock-report',
        pathMatch: 'full',
      },
      {
        path: 'inventory/:id',
        title: 'Session d’inventaire',
        loadComponent: () =>
          import('./inventory/inventory-session/inventory-session.component').then(
            (m) => m.InventorySessionComponent
          ),
      },
      {
        path: 'cash-registers',
        title: 'Caisses',
        loadComponent: () =>
          import('./cash-registers/cash-registers.component').then((m) => m.CashRegistersComponent),
      },
      {
        path: 'clients',
        title: 'Clients',
        loadComponent: () =>
          import('./clients/clients-list/clients-list.component').then(
            (m) => m.ClientsListComponent
          ),
      },
      {
        path: 'clients/:id',
        title: 'Fiche client',
        loadComponent: () =>
          import('./clients/client-detail/client-detail.component').then(
            (m) => m.ClientDetailComponent
          ),
      },
      {
        path: 'consultations',
        title: 'Consultations',
        canActivate: [requireOpenRegisterGuard],
        loadComponent: () =>
          import('./consultations/consultations-list/consultations-list.component').then(
            (m) => m.ConsultationsListComponent
          ),
      },
      {
        path: 'expenses',
        title: 'Dépenses',
        canActivate: [requireOpenRegisterGuard],
        loadComponent: () =>
          import('./expenses/expenses-list/expenses-list.component').then(
            (m) => m.ExpensesListComponent
          ),
      },
      {
        path: 'sales',
        title: 'Ventes',
        loadComponent: () =>
          import('./sales/sales-list/sales-list.component').then((m) => m.SalesListComponent),
      },
      {
        path: 'quotes/new',
        title: 'Nouveau devis',
        loadComponent: () =>
          import('./quotes/quote-editor.component').then((m) => m.QuoteEditorComponent),
      },
      {
        path: 'quotes/:id/convert',
        title: 'Convertir le devis',
        loadComponent: () =>
          import('./quotes/quote-conversion.component').then((m) => m.QuoteConversionComponent),
      },
      {
        path: 'quotes/:id/edit',
        title: 'Modifier le devis',
        loadComponent: () =>
          import('./quotes/quote-editor.component').then((m) => m.QuoteEditorComponent),
      },
      {
        path: 'quotes',
        title: 'Devis',
        loadComponent: () =>
          import('./quotes/quote-list.component').then((m) => m.QuoteListComponent),
      },
      {
        path: 'payments',
        title: 'Paiements',
        loadComponent: () =>
          import('./payments/payments-list/payments-list.component').then(
            (m) => m.PaymentsListComponent
          ),
      },
      {
        path: 'staff',
        title: 'Personnel',
        loadComponent: () =>
          import('./staff/business-staff/business-staff.component').then(
            (m) => m.BusinessStaffComponent
          ),
      },
      {
        path: 'reports',
        title: 'Rapports',
        loadComponent: () =>
          import('./reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'settings',
        title: 'Paramètres clinique',
        loadComponent: () =>
          import('./settings/business-settings/business-settings.component').then(
            (m) => m.BusinessSettingsComponent
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: '**',
        title: 'Page introuvable',
        loadComponent: () =>
          import('./errors/business-not-found/business-not-found.component').then(
            (m) => m.BusinessNotFoundComponent
          ),
      },
    ],
  },
];
