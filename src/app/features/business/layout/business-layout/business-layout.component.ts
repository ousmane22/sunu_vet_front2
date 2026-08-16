import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../auth/services/auth.service';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';
import { BusinessDashboardService } from '../../services/business-dashboard.service';
import { BusinessProfileService } from '../../services/business-profile.service';
import { DashboardAssistantComponent } from '../../dashboard/business-dashboard/components/dashboard-assistant.component';
import { DashboardPwaPromptComponent } from '../../dashboard/business-dashboard/components/dashboard-pwa-prompt.component';
import type { BusinessDashboardStats, BusinessProfile } from '../../models';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  permission?: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-business-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, DashboardAssistantComponent, DashboardPwaPromptComponent],
  templateUrl: './business-layout.component.html',
})
export class BusinessLayoutComponent implements OnInit {
  authService = inject(AuthService);
  strategyService = inject(BusinessStrategyService);
  private dashboardService = inject(BusinessDashboardService);
  private profileService = inject(BusinessProfileService);
  private router = inject(Router);
  user = this.authService.currentUser;
  userMenuOpen = signal(false);
  sidebarOpen = signal(true);
  isMobile = signal(false);
  isRefreshing = signal(false);
  dashboardStats = signal<BusinessDashboardStats | null>(null);
  profile = signal<BusinessProfile | null>(null);

  daysRemaining = computed(() => {
    const p = this.profile();
    if (!p) return -1;
    const sub = p.active_subscription;
    if (sub && sub.days_remaining != null && sub.is_expired !== true) return sub.days_remaining;
    if (p.trial_days_remaining != null) return p.trial_days_remaining;
    return -1;
  });

  showSubscriptionAlert = computed(() => {
    const d = this.daysRemaining();
    return d >= 0 && d <= 5;
  });

  subscriptionEndLabel = computed(() =>
    this.profile()?.is_on_trial ? "période d'essai" : 'abonnement'
  );

  menuGroups: MenuGroup[] = [
    {
      title: 'Vente & Caisse',
      items: [
        { label: 'Point de vente', route: '/business/pos', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', permission: 'pos.sell' },
        { label: 'Historique Ventes', route: '/business/sales', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', permission: 'reports.sales' },
        { label: 'Paiements', route: '/business/payments', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', permission: 'reports.finance' },
        { label: 'Gestion Caisses', route: '/business/cash-registers', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', permission: 'caisse.view' },
        { label: 'Devis & Proformas', route: '/business/quotes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', permission: 'pos.sell' }
      ]
    },
    {
      title: 'Clients & Soins',
      items: [
        { label: 'Clients', route: '/business/clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', permission: 'clients.view' },
        { label: 'Clinique', route: '/business/clinique', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', permission: 'animals.view' },
        { label: 'Calendrier vaccinations', route: '/business/clinique/vaccinations', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', permission: 'vaccinations.view' },
        { label: 'Consultations', route: '/business/consultations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', permission: 'consultations.view' }
      ]
    },
    {
      title: 'Stock',
      items: [
        { label: 'Médicaments', route: '/business/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', permission: 'products.view' },
        { label: 'Catégories', route: '/business/categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', permission: 'products.view' },
        { label: 'Mouvements Stock', route: '/business/stock-movements', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', permission: 'stock.movements.create' },
        { label: 'Inventaire physique', route: '/business/inventory', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', permission: 'stock.inventory.create' },
        { label: 'Rapport de stock', route: '/business/stock-report', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', permission: 'products.view' }
      ]
    },
    {
      title: 'Finances',
      items: [
        { label: 'Dépenses', route: '/business/expenses', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'depenses.view' }
      ]
    },
    {
      title: 'Administration',
      items: [
        { label: 'Personnel', route: '/business/staff', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', permission: 'users.view' },
        { label: 'Rapports', route: '/business/reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', permission: 'reports.sales' },
        { label: 'Paramètres', route: '/business/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0 a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37 a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35 a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37 a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0 a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37 a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 -3.35 a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', permission: 'settings.manage' }
      ]
    }
  ];

  filteredMenuGroups = computed(() => {
    const user = this.user();
    if (!user) return [];

    return this.menuGroups
      .map(group => {
        let title = group.title;
        if (title === 'Clients & Soins' && !this.strategyService.isVet()) {
          title = 'Clients';
        }

        let items = group.items.filter(item => {
          if (!this.strategyService.isMenuVisible(item.label)) return false;
          if (item.route === '/business/inventory') {
            return this.authService.hasPermission('stock.inventory.create')
              || this.authService.hasPermission('stock.inventory.validate');
          }
          return this.authService.hasPermission(item.permission || '');
        });

        // Apply label translation from strategy
        items = items.map(item => {
          if (item.route === '/business/products') {
            return { ...item, label: this.strategyService.getLabel('products') };
          }
          return item;
        });

        return { ...group, title, items };
      })
      .filter(group => group.items.length > 0);
  });

  constructor() {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (this.isNavigationEnd(event)) {
        if (this.isMobile()) {
          this.sidebarOpen.set(false);
        }
        if (event.urlAfterRedirects.includes('/business/pos')) {
          this.sidebarOpen.set(false);
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadDashboardContext();
  }

  private loadDashboardContext(): void {
    this.dashboardService.getStats().subscribe({
      next: (res) => this.dashboardStats.set(res.data),
    });
    this.profileService.getProfile().subscribe({
      next: (res) => this.profile.set(res.data),
    });
  }

  private checkMobile(): void {
    const wasMobile = this.isMobile();
    const nowMobile = window.innerWidth < 768;
    this.isMobile.set(nowMobile);
    
    // If we transition from desktop to mobile, close sidebar
    if (!wasMobile && nowMobile) {
      this.sidebarOpen.set(false);
    }
    // If we transition from mobile to desktop, open sidebar
    if (wasMobile && !nowMobile) {
      this.sidebarOpen.set(true);
    }
  }

  private isNavigationEnd(event: any): event is NavigationEnd {
    return event instanceof NavigationEnd;
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout().subscribe();
  }

  refreshProfile(): void {
    if (this.isRefreshing()) return;
    this.isRefreshing.set(true);
    this.authService.refreshProfile().subscribe({
      next: () => {
        this.isRefreshing.set(false);
        this.closeUserMenu();
      },
      error: () => {
        this.isRefreshing.set(false);
        this.closeUserMenu();
      }
    });
  }
}
