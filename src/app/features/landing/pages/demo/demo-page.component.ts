import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  DEMO_CART,
  DEMO_CHART_DAYS,
  DEMO_CLIENTS,
  DEMO_CONSULTATIONS,
  DEMO_DASHBOARD_NAV,
  DEMO_NAV_GROUPS,
  DEMO_PRODUCTS,
  DEMO_RECENT_ACTIVITY,
  DEMO_STATS,
  DemoView,
} from './demo-page.data';

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './demo-page.component.html',
  styleUrl: './demo-page.component.scss',
})
export class DemoPageComponent {
  protected readonly dashboardNav = DEMO_DASHBOARD_NAV;
  protected readonly navGroups = DEMO_NAV_GROUPS;
  protected readonly stats = DEMO_STATS;
  protected readonly chartDays = DEMO_CHART_DAYS;
  protected readonly recentActivity = DEMO_RECENT_ACTIVITY;
  protected readonly products = DEMO_PRODUCTS;
  protected readonly cart = DEMO_CART;
  protected readonly consultations = DEMO_CONSULTATIONS;
  protected readonly clients = DEMO_CLIENTS;

  protected readonly activeView = signal<DemoView>('dashboard');
  protected readonly sidebarOpen = signal(true);

  protected readonly cartTotal = computed(() =>
    this.cart.reduce((sum, line) => sum + line.qty * line.price, 0),
  );

  protected readonly viewTitle = computed(() => {
    switch (this.activeView()) {
      case 'pos':
        return 'Point de vente';
      case 'consultations':
        return 'Consultations';
      case 'clients':
        return 'Clients';
      default:
        return 'Tableau de bord';
    }
  });

  setView(view: DemoView): void {
    this.activeView.set(view);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  statThemeClasses(theme: string): { iconBg: string; valueClass: string; suffixClass: string } {
    switch (theme) {
      case 'danger':
        return {
          iconBg: 'bg-red-50 text-red-600',
          valueClass: 'text-red-600',
          suffixClass: 'text-red-600 font-medium',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600',
          valueClass: 'text-amber-700',
          suffixClass: 'text-amber-700 font-medium',
        };
      default:
        return {
          iconBg: 'bg-primary-50 text-primary-700',
          valueClass: 'text-gray-900',
          suffixClass: 'text-gray-500',
        };
    }
  }

  formatPrice(value: number): string {
    return `${value.toLocaleString('fr-FR')}\u00a0F`;
  }
}
