import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CashRegisterService } from '../services/cash-register.service';
import { CashRegisterReportPdfService } from './services/cash-register-report-pdf.service';
import { CashRegisterOpenFormComponent } from './components/cash-register-open-form/cash-register-open-form.component';
import { CashRegisterActiveBlockComponent } from './components/cash-register-active-block/cash-register-active-block.component';
import { CashRegisterCloseModalComponent } from './components/cash-register-close-modal/cash-register-close-modal.component';
import { CashRegisterHistoryTableComponent } from './components/cash-register-history-table/cash-register-history-table.component';
import { CashRegisterDetailsModalComponent } from './components/cash-register-details-modal/cash-register-details-modal.component';
import type { CashRegister, CashTransaction } from '../models';

@Component({
    selector: 'app-cash-registers',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CashRegisterOpenFormComponent,
        CashRegisterActiveBlockComponent,
        CashRegisterCloseModalComponent,
        CashRegisterHistoryTableComponent,
        CashRegisterDetailsModalComponent,
    ],
    templateUrl: './cash-registers.component.html',
})
export class CashRegistersComponent implements OnInit {
    private fb = inject(FormBuilder);
    private cashRegisterService = inject(CashRegisterService);
    private reportPdf = inject(CashRegisterReportPdfService);
    private route = inject(ActivatedRoute);

    /** Redirection depuis une route protégée (consultations / dépenses) sans caisse ouverte. */
    openRegisterRequiredNotice = signal(false);

    activeRegister         = signal<CashRegister | null>(null);
    isLoading              = signal(true);
    isSubmitting           = signal(false);
    showCloseModal         = signal(false);
    registerToCorrect      = signal<CashRegister | null>(null);
    detailsRegister        = signal<CashRegister | null>(null);
    successMessage    = signal<string | null>(null);
    errorMessage      = signal<string | null>(null);
    history           = signal<CashRegister[]>([]);
    isLoadingHistory  = signal(false);

    openForm = this.fb.group({
        opening_balance: [0 as number, [Validators.required, Validators.min(0)]],
    });

    theoreticalBalance = computed(() => {
        const active = this.activeRegister();
        if (!active) return 0;
        const opening = Number(active.opening_balance) || 0;
        const income = active.transactions?.filter((t: CashTransaction) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) ?? 0;
        const expense = active.transactions?.filter((t: CashTransaction) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) ?? 0;
        return opening + income - expense;
    });

    ngOnInit(): void {
        if (this.route.snapshot.queryParamMap.get('reason') === 'open_register_required') {
            this.openRegisterRequiredNotice.set(true);
        }
        this.checkCurrentRegister();
        this.loadHistory();
    }

    loadHistory(): void {
        this.isLoadingHistory.set(true);
        this.cashRegisterService.getHistory().subscribe({
            next: (res) => {
                this.history.set(res.data);
                this.isLoadingHistory.set(false);
            },
            error: () => this.isLoadingHistory.set(false),
        });
    }

    checkCurrentRegister(): void {
        this.isLoading.set(true);
        // forceRefresh = true : la page de gestion doit toujours afficher l'état réel
        // et invalide le cache pour les autres composants (POS…) qui l'utilisent.
        this.cashRegisterService.getCurrent(true).subscribe({
            next: (res) => {
                this.activeRegister.set(res.data);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false),
        });
    }

    openRegister(): void {
        if (this.openForm.invalid || this.isSubmitting()) return;
        this.isSubmitting.set(true);
        this.errorMessage.set(null);
        this.successMessage.set(null);
        this.cashRegisterService.open({ opening_balance: this.openForm.value.opening_balance ?? 0 }).subscribe({
            next: (res) => {
                this.activeRegister.set(res.data);
                this.isSubmitting.set(false);
                this.successMessage.set(res.message ?? 'Caisse ouverte.');
            },
            error: (err) => {
                this.errorMessage.set(err.error?.message ?? 'Impossible d\'ouvrir la caisse.');
                this.isSubmitting.set(false);
            },
        });
    }

    openCloseModal(): void {
        this.showCloseModal.set(true);
    }

    dismissCloseModal(): void {
        this.showCloseModal.set(false);
    }

    closeRegister(closingBalance: number): void {
        if (this.isSubmitting() || !this.activeRegister()) return;
        this.isSubmitting.set(true);
        this.errorMessage.set(null);
        this.successMessage.set(null);

        this.cashRegisterService.close(this.activeRegister()!.id, { closing_balance: closingBalance }).subscribe({
            next: (res) => {
                this.activeRegister.set(null);
                this.isSubmitting.set(false);
                this.showCloseModal.set(false);
                this.successMessage.set(res.message ?? 'Caisse fermée.');
                this.loadHistory();
            },
            error: (err) => {
                this.errorMessage.set(err.error?.message ?? 'Impossible de clôturer la caisse.');
                this.isSubmitting.set(false);
            },
        });
    }

    getTheoreticalFinal(register: CashRegister): number {
        const income = register.transactions?.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
        const expense = register.transactions?.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
        return Number(register.opening_balance) + income - expense;
    }

    getDifference(register: CashRegister): number {
        if (register.status === 'open') return 0;
        return (Number(register.closing_balance) || 0) - this.getTheoreticalFinal(register);
    }

    /** Références stables pour le tableau historique (évite perte de this). */
    getTheoreticalFinalFn = (reg: CashRegister) => this.getTheoreticalFinal(reg);
    getDifferenceFn = (reg: CashRegister) => this.getDifference(reg);

    openCorrectionModal(register: CashRegister): void {
        this.registerToCorrect.set(register);
    }

    dismissCorrectionModal(): void {
        this.registerToCorrect.set(null);
    }

    correctRegisterBalance(closingBalance: number): void {
        const register = this.registerToCorrect();
        if (!register || this.isSubmitting()) return;

        this.isSubmitting.set(true);
        this.errorMessage.set(null);

        this.cashRegisterService.correctBalance(register.id, closingBalance).subscribe({
            next: (res) => {
                if (res.data) {
                    this.history.update(list =>
                        list.map(r => r.id === register.id ? res.data! : r)
                    );
                }
                this.isSubmitting.set(false);
                this.registerToCorrect.set(null);
                this.successMessage.set('Montant de fermeture corrigé.');
            },
            error: (err) => {
                this.errorMessage.set(err.error?.message ?? 'Impossible de corriger le montant.');
                this.isSubmitting.set(false);
            },
        });
    }

    openDetails(register?: CashRegister): void {
        const reg = register ?? this.activeRegister() ?? null;
        if (reg) this.detailsRegister.set(reg);
    }

    toggleDetails(): void {
        this.detailsRegister.set(null);
    }

    exportSessionPdf(register: CashRegister): void {
        this.reportPdf.exportSessionPdf(register);
    }

    onExportHistoryPdf(): void {
        this.reportPdf.exportHistoryPdf(this.history(), this.getTheoreticalFinal.bind(this), this.getDifference.bind(this));
    }
}




