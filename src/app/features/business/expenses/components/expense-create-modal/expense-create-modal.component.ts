import { Component, inject, signal, output, input, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../../services/expense.service';
import type { CreateExpensePayload, Expense } from '../../../models';

@Component({
    selector: 'app-expense-create-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './expense-create-modal.component.html',
})
export class ExpenseCreateModalComponent {
    private expenseService = inject(ExpenseService);
    private fb = inject(FormBuilder);

    open    = input<boolean>(false);
    expense = input<Expense | null>(null);

    closeModal      = output<void>();
    expenseCreated  = output<Expense>();
    expenseUpdated  = output<Expense>();

    isEditMode  = computed(() => !!this.expense());
    modalTitle  = computed(() => this.isEditMode() ? 'Modifier la dépense' : 'Nouvelle dépense');
    submitLabel = computed(() => this.isEditMode() ? 'Enregistrer les modifications' : 'Enregistrer la dépense');

    isSubmitting = signal(false);
    errorMessage = signal<string | null>(null);

    readonly categories = [
        { value: 'achats', label: 'Achats (Fournitures, Médicaments)' },
        { value: 'salaires', label: 'Salaires / Avances' },
        { value: 'factures', label: 'Factures (Élec, Eau, Internet)' },
        { value: 'entretien', label: 'Entretien / Maintenance' },
        { value: 'remboursements', label: 'Remboursements Clients' },
        { value: 'autres', label: 'Autres' }
    ];

    readonly paymentMethods = [
        { value: 'cash', label: 'Espèces (Caisse)' },
        { value: 'card', label: 'Carte Bancaire' },
        { value: 'mobile_money', label: 'Mobile Money' }
    ];

    form = this.fb.group({
        category:           ['', Validators.required],
        amount:             [0 as number, [Validators.required, Validators.min(0.01)]],
        payment_method:     ['cash' as 'cash' | 'card' | 'mobile_money', Validators.required],
        description:        [''],
        reference_document: [''],
        expense_date:       [new Date().toISOString().split('T')[0], Validators.required],
    });

    constructor() {
        effect(() => {
            const e = this.expense();
            if (e) {
                this.form.patchValue({
                    category:           e.category ?? '',
                    amount:             Number(e.amount),
                    payment_method:     (e.payment_method as 'cash' | 'card' | 'mobile_money') ?? 'cash',
                    description:        e.description ?? '',
                    reference_document: e.reference_document ?? '',
                    expense_date:       e.expense_date
                        ? e.expense_date.split('T')[0]
                        : new Date().toISOString().split('T')[0],
                });
            } else {
                this.form.reset({
                    category: '', amount: 0, payment_method: 'cash',
                    description: '', reference_document: '',
                    expense_date: new Date().toISOString().split('T')[0],
                });
            }
        });
    }

    onClose(): void {
        this.closeModal.emit();
    }

    submit(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }

        this.isSubmitting.set(true);
        this.errorMessage.set(null);

        this.isEditMode() ? this.submitEdit() : this.submitCreate();
    }

    private submitCreate(): void {
        const v = this.form.getRawValue();
        const payload: CreateExpensePayload = {
            category:           v.category!,
            amount:             Number(v.amount),
            payment_method:     v.payment_method!,
            description:        v.description || undefined,
            reference_document: v.reference_document || undefined,
            expense_date:       v.expense_date || undefined,
        };

        this.expenseService.create(payload).subscribe({
            next: (res) => { this.isSubmitting.set(false); this.expenseCreated.emit(res.data); this.onClose(); },
            error: (err) => { this.errorMessage.set(err.error?.message ?? 'Erreur.'); this.isSubmitting.set(false); }
        });
    }

    private submitEdit(): void {
        const e = this.expense()!;
        const v = this.form.getRawValue();
        const payload: Record<string, unknown> = {};

        if (v.category !== e.category)                              payload['category'] = v.category;
        if (Number(v.amount) !== Number(e.amount))                  payload['amount'] = Number(v.amount);
        if (v.payment_method !== e.payment_method)                  payload['payment_method'] = v.payment_method;
        if ((v.description ?? '') !== (e.description ?? ''))        payload['description'] = v.description ?? null;
        if ((v.reference_document ?? '') !== (e.reference_document ?? '')) payload['reference_document'] = v.reference_document ?? null;
        const expDate = e.expense_date ? e.expense_date.split('T')[0] : '';
        if ((v.expense_date ?? '') !== expDate)                     payload['expense_date'] = v.expense_date ?? null;

        if (Object.keys(payload).length === 0) { this.isSubmitting.set(false); this.onClose(); return; }

        this.expenseService.update(e.id, payload).subscribe({
            next: (res) => { this.isSubmitting.set(false); this.expenseUpdated.emit(res.data); this.onClose(); },
            error: (err) => { this.errorMessage.set(err.error?.message ?? 'Erreur.'); this.isSubmitting.set(false); }
        });
    }
}




