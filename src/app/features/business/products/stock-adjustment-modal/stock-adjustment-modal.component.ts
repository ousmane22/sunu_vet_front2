import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';
import { AdjustStockPayload, Product } from '../../models';

/** Raisons prédéfinies pour les ajustements */
const QUICK_REASONS = [
  { value: 'Réception commande', label: 'Réception commande' },
  { value: 'Inventaire', label: 'Inventaire' },
  { value: 'Casse / Péremption', label: 'Casse / Péremption' },
  { value: 'Don / Échantillon', label: 'Don / Échantillon' },
  { value: 'Retour client', label: 'Retour client' },
  { value: 'Correction erreur', label: 'Correction erreur' },
] as const;

@Component({
  selector: 'app-stock-adjustment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock-adjustment-modal.component.html',
})
export class StockAdjustmentModalComponent {
  @Input() product: Product | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  strategyService = inject(BusinessStrategyService);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  readonly quickReasons = QUICK_REASONS;

  form = this.fb.group({
    type: ['IN' as 'IN' | 'OUT' | 'ADJUSTMENT', Validators.required],
    quantity: [1, [Validators.required, Validators.min(0.001)]],
    reason: ['', Validators.maxLength(255)],
  });

  /** Quantité signée envoyée à l'API (négative pour sortie) */
  readonly deltaQuantity = computed(() => {
    const type = this.form.get('type')?.value;
    const qty = +(this.form.get('quantity')?.value ?? 0);
    if (type === 'OUT') return -Math.abs(qty);
    if (type === 'ADJUSTMENT') return qty; 
    return Math.abs(qty);
  });

  /** Stock après ajustement (aperçu) */
  readonly stockAfter = computed(() => {
    const med = this.product;
    if (!med) return null;
    const delta = this.deltaQuantity();
    const after = med.stock_quantity + delta;
    return Math.max(0, +after.toFixed(3));
  });

  /** Erreur si sortie > stock actuel */
  readonly quantityError = computed(() => {
    const med = this.product;
    const type = this.form.get('type')?.value;
    const qty = +(this.form.get('quantity')?.value ?? 0);
    if (!med || type !== 'OUT' || qty <= med.stock_quantity) return null;
    return `Stock insuffisant. Maximum : ${med.stock_quantity}`;
  });

  get type() {
    return this.form.get('type')!;
  }

  get quantity() {
    return this.form.get('quantity')!;
  }

  get reason() {
    return this.form.get('reason')!;
  }

  setQuickReason(value: string) {
    this.form.patchValue({ reason: value });
  }

  setQuickQuantity(value: number) {
    const type = this.form.get('type')?.value;
    const current = this.form.get('quantity')?.value ?? 0;
    if (type === 'IN') {
      this.form.patchValue({ quantity: current + value });
    }
  }

  onSubmit() {
    this.errorMessage.set(null);
    const err = this.quantityError();
    if (err) {
      this.errorMessage.set(err);
      return;
    }
    if (this.form.invalid || !this.product) return;

    this.isSubmitting.set(true);

    const formValue = this.form.value;
    let finalQuantity = formValue.quantity ?? 0;
    if (formValue.type === 'OUT') finalQuantity = -finalQuantity;

    const payload: AdjustStockPayload = {
      type: formValue.type as 'IN' | 'OUT' | 'ADJUSTMENT',
      quantity: finalQuantity,
      reason: formValue.reason?.trim() || undefined,
    };

    this.productService.adjustStock(this.product.id, payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.form.reset({ type: 'IN', quantity: 1, reason: '' });
        this.saved.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Une erreur est survenue lors de l\'ajustement du stock.');
      },
    });
  }

  onClose() {
    this.form.reset({ type: 'IN', quantity: 1, reason: '' });
    this.errorMessage.set(null);
    this.close.emit();
  }
}




