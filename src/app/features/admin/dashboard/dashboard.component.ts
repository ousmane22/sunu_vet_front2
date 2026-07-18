import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/services/auth.service';
import { DashboardService } from '../services/dashboard.service';

import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  authService = inject(AuthService);
  dashboardService = inject(DashboardService);
  private router = inject(Router);

  // Computed signal for the dashboard user
  user = this.authService.currentUser;

  // Reactively fetch stats as a signal
  stats = toSignal(this.dashboardService.getStats());

  logout() {
    this.authService.logout().subscribe();
  }
}




