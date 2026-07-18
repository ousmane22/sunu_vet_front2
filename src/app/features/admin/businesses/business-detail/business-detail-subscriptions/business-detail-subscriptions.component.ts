import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessService } from '../../../services/business.service';
import { ModalService } from '../../../../../core/services/modal.service';
import { Business, Subscription } from '../../../models';
import { SubscriptionModalComponent } from '../../subscription-modal/subscription-modal.component';

const M_SUB = 'business-sub';
const M_SUB_EDIT = 'business-sub-edit';

@Component({
  selector: 'app-business-detail-subscriptions',
  standalone: true,
  imports: [CommonModule, SubscriptionModalComponent],
  templateUrl: './business-detail-subscriptions.component.html',
})
export class BusinessDetailSubscriptionsComponent {
  private businessService = inject(BusinessService);
  modalService = inject(ModalService);

  business = input.required<Business>();
  refreshed = output<void>();

  readonly M_SUB = M_SUB;
  readonly M_SUB_EDIT = M_SUB_EDIT;
  selectedSub = signal<Subscription | null>(null);

  onSaved(modal: string) {
    this.modalService.close(modal);
    this.refreshed.emit();
  }

  openEditSub(sub: Subscription) {
    this.selectedSub.set(sub);
    this.modalService.open(M_SUB_EDIT);
  }

  deleteSubscription(subId: number) {
    if (!confirm('Supprimer cet abonnement définitivement ?')) return;
    const business = this.business();
    this.businessService.deleteSubscription(business.id, subId).subscribe({
      next: () => this.refreshed.emit(),
    });
  }

  /** Même jour calendaire (UTC) pour éviter les faux positifs fuseau. */
  trialSubscriptionDateMismatch(sub: Subscription): boolean {
    const trialEnd = this.business().trial_ends_at;
    if (!trialEnd || sub.plan?.slug !== 'trial' || !sub.ends_at) {
      return false;
    }
    const a = new Date(trialEnd).toISOString().slice(0, 10);
    const b = new Date(sub.ends_at).toISOString().slice(0, 10);
    return a !== b;
  }
}




