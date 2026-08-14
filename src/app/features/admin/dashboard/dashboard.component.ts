import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AuthService } from '../../auth/services/auth.service';
import { DashboardService } from '../services/dashboard.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { SuperAdminRevenueChartComponent } from './components/super-admin-revenue-chart.component';
import { SuperAdminBusinessesChartComponent } from './components/super-admin-businesses-chart.component';
import { FormatPricePipe } from '../../../core/pipes';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatCardComponent,
    SuperAdminRevenueChartComponent,
    SuperAdminBusinessesChartComponent,
    FormatPricePipe,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  authService = inject(AuthService);
  dashboardService = inject(DashboardService);

  user = this.authService.currentUser;
  stats = toSignal(this.dashboardService.getStats());

  readonly quickActions = [
    { label: 'Entreprises', route: '/super-admin/businesses' },
    { label: 'Revenus', route: '/super-admin/revenue' },
    { label: 'Paramètres', route: '/super-admin/settings' },
  ];

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }
}
