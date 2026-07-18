import { Component, inject, input, output, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormatPricePipe } from '../../../../../core/pipes';

@Component({
    selector: 'app-cash-register-close-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormatPricePipe],
    templateUrl: './cash-register-close-modal.component.html',
})
export class CashRegisterCloseModalComponent {
    private fb = inject(FormBuilder);

    open               = input<boolean>(false);
    theoreticalBalance = input<number>(0);
    isSubmitting       = input<boolean>(false);
    prefillValue       = input<number | null>(null);
    isCorrection       = input<boolean>(false);

    closeModal              = output<void>();
    closingBalanceConfirmed = output<number>();

    form = this.fb.group({
        closing_balance: [0 as number, [Validators.required, Validators.min(0)]],
    });

    modalTitle    = computed(() => this.isCorrection() ? 'Corriger le montant de fermeture' : 'Fermer la caisse');
    modalSubtitle = computed(() => this.isCorrection()
        ? 'Saisissez le montant réel compté lors de la fermeture'
        : 'Comptez physiquement le montant en caisse');
    submitLabel   = computed(() => this.isCorrection() ? 'Enregistrer la correction' : 'Valider & Fermer');

    constructor() {
        effect(() => {
            if (this.open()) {
                const prefill = this.prefillValue();
                this.form.reset({ closing_balance: prefill !== null ? Math.round(Number(prefill)) : 0 });
            } else {
                this.form.reset({ closing_balance: 0 });
            }
        });
    }

    get difference(): number {
        return (Number(this.form.get('closing_balance')!.value) || 0) - this.theoreticalBalance();
    }

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) return;
        this.closingBalanceConfirmed.emit(Number(this.form.value.closing_balance));
    }
}
