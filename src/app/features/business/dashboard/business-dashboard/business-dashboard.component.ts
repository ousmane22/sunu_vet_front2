import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { BusinessDashboardService } from '../../services/business-dashboard.service';
import { BusinessProfileService } from '../../services/business-profile.service';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { QUICK_STAT_CONFIG, QuickStatItemConfig } from './quick-stat.config';
import type { BusinessDashboardStats, BusinessProfile } from '../../models';

@Component({
  selector: 'app-business-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent],
  templateUrl: './business-dashboard.component.html',
})
export class BusinessDashboardComponent implements OnInit {
  private readonly rawQuickStatConfig = QUICK_STAT_CONFIG;
  authService = inject(AuthService);
  dashboardService = inject(BusinessDashboardService);
  profileService = inject(BusinessProfileService);
  strategyService = inject(BusinessStrategyService);

  user = this.authService.currentUser;
  stats = signal<BusinessDashboardStats | null>(null);
  profile = signal<BusinessProfile | null>(null);
  isLoading = signal(true);

  /** Stats filtrées (ex: retirer les consultations si pas vétérinaire). */
  dashboardStats = computed(() => {
    const s = this.stats();
    if (!s) return null;

    if (this.strategyService.isVet()) return s;

    return {
      ...s,
      recent_activities: s.recent_activities.filter(a => a.type !== 'consultation')
    };
  });

  /** Configuration filtrée et renommée selon la stratégie. */
  quickStatConfig = computed(() => {
    const isVet = this.strategyService.isVet();
    const productLabel = this.strategyService.getLabel('products');
    
    return this.rawQuickStatConfig
      .filter(item => isVet || item.key !== 'today_consultations')
      .map(item => {
        if (item.key === 'low_stock_items') {
          return {
            ...item,
            label: `Alertes ${productLabel}`,
            suffix: productLabel.toLowerCase()
          };
        }
        return item;
      });
  });

  /** Jours restants (essai ou abonnement). -1 si non concerné ou inconnu. */
  daysRemaining = computed(() => {
    const p = this.profile();
    if (!p) return -1;
    const sub = p.active_subscription;
    if (sub && sub.days_remaining != null && sub.is_expired !== true) return sub.days_remaining;
    if (p.trial_days_remaining != null) return p.trial_days_remaining;
    return -1;
  });

  /** Afficher l’alerte « 5 jours ou moins » avant fin. */
  showSubscriptionAlert = computed(() => {
    const d = this.daysRemaining();
    return d >= 0 && d <= 5;
  });

  ngOnInit() {
    this.loadStats();
    this.loadProfile();
  }

  loadStats() {
    this.isLoading.set(true);
    this.dashboardService.getStats().subscribe({
      next: (response) => {
        this.stats.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (res) => this.profile.set(res.data),
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  /** Libellé pour l’alerte : période d’essai ou abonnement. */
  getSubscriptionEndLabel(): string {
    return this.profile()?.is_on_trial ? "période d'essai" : 'abonnement';
  }
}




