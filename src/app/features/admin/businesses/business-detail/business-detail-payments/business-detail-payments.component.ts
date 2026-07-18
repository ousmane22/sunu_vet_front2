import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessService } from '../../../services/business.service';
import { ModalService } from '../../../../../core/services/modal.service';
import { Business, SubscriptionPayment } from '../../../models';
import { PaymentModalComponent } from '../../payment-modal/payment-modal.component';

const M_PAY = 'business-pay';
const M_PAY_EDIT = 'business-pay-edit';

@Component({
  selector: 'app-business-detail-payments',
  standalone: true,
  imports: [CommonModule, PaymentModalComponent],
  templateUrl: './business-detail-payments.component.html',
})
export class BusinessDetailPaymentsComponent {
  private businessService = inject(BusinessService);
  modalService = inject(ModalService);

  business = input.required<Business>();
  refreshed = output<void>();

  readonly M_PAY = M_PAY;
  readonly M_PAY_EDIT = M_PAY_EDIT;
  selectedPayment = signal<SubscriptionPayment | null>(null);

  /** Liste aplatie de tous les paiements avec planName, triée par date décroissante */
  allPayments = computed(() => {
    const subs = this.business()?.subscriptions ?? [];
    return subs
      .flatMap(s => (s.payments ?? []).map(p => ({ ...p, planName: s.plan?.name })))
      .sort((a, b) => new Date(b.paid_at ?? 0).getTime() - new Date(a.paid_at ?? 0).getTime());
  });

  totalRevenue = computed(() =>
    this.allPayments().filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0)
  );

  onSaved(modal: string) {
    this.modalService.close(modal);
    this.refreshed.emit();
  }

  openEditPayment(payment: SubscriptionPayment) {
    this.selectedPayment.set(payment);
    this.modalService.open(M_PAY_EDIT);
  }

  deletePayment(payment: SubscriptionPayment) {
    if (!confirm('Supprimer ce paiement définitivement ?')) return;
    const business = this.business();
    this.businessService.deletePayment(business.id, payment.subscription_id, payment.id).subscribe({
      next: () => this.refreshed.emit(),
    });
  }
}




