import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { Business, SubscriptionPayment } from '../../models';
import { BusinessModalComponent } from '../business-modal/business-modal.component';
import { ModalService } from '../../../../core/services/modal.service';
import { AuthService } from '../../../auth/services/auth.service';
import { BusinessDetailInfoComponent } from './business-detail-info/business-detail-info.component';
import { BusinessDetailSubscriptionsComponent } from './business-detail-subscriptions/business-detail-subscriptions.component';
import { BusinessDetailPaymentsComponent } from './business-detail-payments/business-detail-payments.component';
import { BusinessDetailAdminsComponent } from './business-detail-admins/business-detail-admins.component';
import { FormatPricePipe } from '../../../../core/pipes';

export type TabId = 'info' | 'subscriptions' | 'payments' | 'admins';

const M_EDIT = 'business-edit';

@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BusinessModalComponent,
    BusinessDetailInfoComponent,
    BusinessDetailSubscriptionsComponent,
    BusinessDetailPaymentsComponent,
    BusinessDetailAdminsComponent,
    FormatPricePipe,
  ],
  templateUrl: './business-detail.component.html',
})
export class BusinessDetailComponent implements OnInit {
  private businessService = inject(BusinessService);
  private route = inject(ActivatedRoute);
  modalService = inject(ModalService);
  private authService = inject(AuthService);

  readonly M_EDIT = M_EDIT;

  business = signal<Business | null>(null);
  isLoading = signal<boolean>(true);
  activeTab = signal<TabId>('info');
  connecting = signal(false);
  connectError = signal<string | null>(null);

  tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'info', label: 'Informations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'subscriptions', label: 'Abonnements', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'payments', label: 'Paiements', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'admins', label: 'Administrateurs', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  ];

  subscriptionsCount = computed(() => this.business()?.subscriptions?.length ?? 0);
  adminsCount = computed(() => this.business()?.users?.length ?? 0);

  allPayments = computed(() => {
    const subs = this.business()?.subscriptions ?? [];
    const payments: SubscriptionPayment[] = [];
    for (const sub of subs) {
      if (sub.payments?.length) payments.push(...sub.payments);
    }
    return payments.sort(
      (a, b) => new Date(b.paid_at || 0).getTime() - new Date(a.paid_at || 0).getTime()
    );
  });

  paymentsCount = computed(() => this.allPayments().length);

  totalRevenue = computed(() =>
    this.allPayments()
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0)
  );

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) this.load(Number(params['id']));
    });
    this.route.queryParams.subscribe((q) => {
      const tab = q['tab'];
      if (tab === 'payments' || tab === 'subscriptions' || tab === 'admins' || tab === 'info') {
        this.activeTab.set(tab);
      }
    });
  }

  load(id: number) {
    this.isLoading.set(true);
    this.businessService.getBusinessDetails(id).subscribe({
      next: (res) => {
        this.business.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  reload() {
    const id = this.business()?.id;
    if (id) this.load(id);
  }

  onBusinessSaved() {
    this.modalService.close(M_EDIT);
    this.reload();
  }

  onTabRefreshed() {
    this.reload();
  }

  setTab(tab: TabId) {
    this.activeTab.set(tab);
  }

  businessTypeLabel(type?: string): string {
    if (type === 'veterinary') return 'Clinique vétérinaire';
    if (type === 'retail') return 'Pharmacie';
    return type || 'Entreprise';
  }

  connectAsBusiness() {
    const b = this.business();
    if (!b?.is_active || this.connecting()) return;

    this.connectError.set(null);
    this.connecting.set(true);

    this.authService.impersonateBusiness(b.id).subscribe({
      error: (err) => {
        this.connecting.set(false);
        const msg =
          err?.error?.errors?.business?.[0]
          ?? err?.error?.message
          ?? 'Impossible d\'accéder à cette entreprise.';
        this.connectError.set(msg);
      },
    });
  }
}
