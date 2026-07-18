import { Component, output, input, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormatPricePipe } from '../../../core/pipes';

export type PaymentMethod = 'cash' | 'card' | 'mobile_money';

export interface AddPaymentPayload {
  amount: number;
  payment_method: PaymentMethod;
  note?: string;
}

@Component({
  selector: 'app-add-payment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormatPricePipe],
  templateUrl: './add-payment-modal.component.html',
})
export class AddPaymentModalComponent {
  private fb = inject(FormBuilder);

  /** Affichage du modal */
  open = input<boolean>(false);
  /** Montant restant dû (CFA) */
  amountDue = input<number>(0);
  /** Libellé de référence (ex. "Vente #12345", "Consultation #12") */
  referenceLabel = input<string>('');
  /** Nom du client (optionnel, affiché dans le récap) */
  clientName = input<string | null>(null);
  /** Afficher le champ note */
  showNote = input<boolean>(false);
  /** En cours d'envoi (désactive le bouton) */
  isSubmitting = input<boolean>(false);
  /** Montant max autorisé (défaut: amountDue) */
  maxAmount = input<number | null>(null);

  submitPayload = output<AddPaymentPayload>();
  closeModal = output<void>();

  readonly paymentMethodOptions = ['cash', 'card', 'mobile_money'] as const;

  form = this.fb.group({
    amount: [0, [Validators.required, Validators.min(1)]],
    payment_method: ['cash' as PaymentMethod, Validators.required],
    note: [''],
  });

  constructor() {
    effect(() => {
      const open = this.open();
      const due = this.amountDue();
      const max = this.maxAmount();
      if (open) {
        const maxVal = max ?? due;
        this.form.patchValue({
          amount: Math.round(due),
          payment_method: 'cash',
          note: '',
        });
        this.form.get('amount')?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(Math.max(0, maxVal)),
        ]);
        this.form.get('amount')?.updateValueAndValidity();
      }
    });
  }

  setPaymentMethod(m: PaymentMethod): void {
    this.form.patchValue({ payment_method: m });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.submitPayload.emit({
      amount: Number(v.amount),
      payment_method: (v.payment_method ?? 'cash') as PaymentMethod,
      note: this.showNote() ? (v.note || undefined) : undefined,
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }
}


