import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormatPricePipe, FormatDatePipe } from '../../../../core/pipes';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../../auth/services/auth.service';
import { PAGINATION } from '../../../../core/config/pagination.config';
import type { Expense } from '../../models';
import { ExpenseCreateModalComponent } from '../components/expense-create-modal/expense-create-modal.component';
import { SunuDialogService } from '../../../../shared/services/sunu-dialog.service';
import { OpenRegisterPromptService } from '../../services/open-register-prompt.service';
import { OpenRegisterPromptComponent } from '../../../../shared/components/open-register-prompt/open-register-prompt.component';

@Component({
    selector: 'app-expenses-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormatPricePipe, FormatDatePipe, ExpenseCreateModalComponent, OpenRegisterPromptComponent],
    templateUrl: './expenses-list.component.html',
})
export class ExpensesListComponent implements OnInit {
    private expenseService = inject(ExpenseService);
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private dialog = inject(SunuDialogService);
    private registerPrompt = inject(OpenRegisterPromptService);

    can(perm: string): boolean {
        return this.authService.hasPermission(perm);
    }

    expenses = signal<Expense[]>([]);
    isLoading = signal(true);

    // Modal state
    showModal     = signal(false);
    expenseToEdit = signal<Expense | null>(null);
    showRegisterPrompt = signal(false);

    // Filters
    filterForm = this.fb.group({
        date: [''],
        category: [''],
        status: [''],
    });


    readonly categories = [
        { value: 'achats', label: 'Achats (Fournitures, Médicaments)' },
        { value: 'salaires', label: 'Salaires / Avances' },
        { value: 'factures', label: 'Factures (Élec, Eau, Internet)' },
        { value: 'entretien', label: 'Entretien / Maintenance' },
        { value: 'remboursements', label: 'Remboursements Clients' },
        { value: 'autres', label: 'Autres' }
    ];

    totalAmount = computed(() => {
        return this.expenses()
            .filter(e => e.status === 'completed')
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
    });

    ngOnInit(): void {
        this.loadExpenses();

        // Reload on filter change
        this.filterForm.valueChanges.subscribe(() => {
            this.loadExpenses();
        });
    }

    loadExpenses(): void {
        this.isLoading.set(true);
        const filters = this.filterForm.value;

        this.expenseService.getAll({
            date: filters.date || undefined,
            category: filters.category || undefined,
            status: filters.status || undefined,
            per_page: PAGINATION.DEFAULT,
        }).subscribe({
            next: (res) => {
                this.expenses.set(res.data);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            }
        });
    }

    openModal(): void {
        this.registerPrompt.canProceed().subscribe((ok) => {
            if (ok) {
                this.expenseToEdit.set(null);
                this.showModal.set(true);
            } else {
                this.showRegisterPrompt.set(true);
            }
        });
    }

    onOpenRegisterFromPrompt(): void {
        this.showRegisterPrompt.set(false);
        this.registerPrompt.openRegisterPage('/business/expenses');
    }

    closeModal(): void {
        this.showModal.set(false);
        this.expenseToEdit.set(null);
    }

    openEditModal(expense: Expense): void {
        this.expenseToEdit.set(expense);
        this.showModal.set(true);
    }

    onExpenseCreated(expense: Expense): void {
        // Insertion en tête (tri par date décroissante), zéro appel réseau
        this.expenses.update(list => [expense, ...list]);
    }

    onExpenseUpdated(updated: Expense): void {
        this.expenses.update(list => list.map(e => e.id === updated.id ? updated : e));
    }

    async cancelExpense(expense: Expense): Promise<void> {
        if (expense.status === 'cancelled') return;

        const confirmed = await this.dialog.confirm(
            `Êtes-vous sûr de vouloir annuler cette dépense de ${expense.amount} CFA ?`,
            { title: 'Annuler la dépense', destructive: true },
        );
        if (!confirmed) return;

        this.expenseService.cancel(expense.id).subscribe({
            next: () => this.loadExpenses(),
            error: async (err) => {
                await this.dialog.alert(err.error?.message || "Erreur lors de l'annulation", {
                    type: 'danger',
                    title: 'Erreur',
                });
            },
        });
    }

    getCategoryLabel(val: string): string {
        return this.categories.find(c => c.value === val)?.label || val;
    }
}




