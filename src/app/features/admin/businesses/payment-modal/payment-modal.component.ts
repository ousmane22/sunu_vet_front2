import { Component, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BusinessService } from '../../services/business.service';
import { Subscription, SubscriptionPayment } from '../../models';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-modal.component.html',
})
export class PaymentModalComponent {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);

  businessId = input.required<number>();
  subscriptions = input.required<Subscription[]>();
  payment = input<SubscriptionPayment | null>(null); // Pour l'édition
  saved = output<void>();
  cancelled = output<void>();

  isSubmitting = false;
  serverError: string | null = null;

  paymentMethods = ['Wave', 'Orange Money', 'Carte Bancaire', 'Cash', 'Virement bancaire'];

  form = this.fb.group({
    subscription_id: [null as number | null, [Validators.required]],
    amount: [null as number | null, [Validators.required, Validators.min(0)]],
    payment_method: ['', [Validators.required]],
    status: ['completed', [Validators.required]],
    transaction_id: [null as string | null],
    paid_at: [new Date().toISOString().substring(0, 10), [Validators.required]],
  });

  constructor() {
    // Pré-remplir le formulaire si on édite un paiement
    effect(() => {
      const payment = this.payment();
      if (payment) {
        this.form.patchValue({
          subscription_id: payment.subscription_id,
          amount: payment.amount,
          payment_method: payment.payment_method,
          status: payment.status,
          transaction_id: payment.transaction_id,
          paid_at: payment.paid_at ? new Date(payment.paid_at).toISOString().substring(0, 10) : null,
        });
      }
    });
  }

  get f() { return this.form.controls; }
  get isEditMode() { return !!this.payment(); }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting = true;
    this.serverError = null;

    const { subscription_id, ...rest } = this.form.value;
    const payment = this.payment();

    if (payment) {
      // Mode édition
      this.businessService.updatePayment(this.businessId(), payment.subscription_id, payment.id, rest).subscribe({
        next: () => { this.isSubmitting = false; this.saved.emit(); },
        error: (err) => this.handleError(err)
      });
    } else {
      // Mode création
      this.businessService.addPayment(this.businessId(), subscription_id!, rest).subscribe({
        next: () => { this.isSubmitting = false; this.saved.emit(); },
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any) {
    this.isSubmitting = false;
    const errors = err.error?.errors;
    this.serverError = errors
      ? (Object.values(errors).flat()[0] as string)
      : (err.error?.message ?? 'Erreur inattendue.');
  }

  cancel() { this.cancelled.emit(); }
}




