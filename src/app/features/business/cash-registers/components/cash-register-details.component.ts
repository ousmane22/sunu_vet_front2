import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPricePipe } from '../../../../core/pipes';
import { CashRegisterReportPdfService } from '../services/cash-register-report-pdf.service';
import {
    isCashRefund,
    sumCashBusinessExpenses,
    sumCashIncome,
    sumCashOutflows,
    sumCashRefunds,
} from '../utils/cash-transaction.util';
import type { CashRegister } from '../../models';

/**
 * Affiche le détail d'une session caisse : résumé (ouverture, encaissements, dépenses, remboursements),
 * journal des opérations et solde théorique.
 */
@Component({
    selector: 'app-cash-register-details',
    standalone: true,
    imports: [CommonModule, FormatPricePipe],
    templateUrl: './cash-register-details.component.html',
})
export class CashRegisterDetailsComponent {
    private reportPdf = inject(CashRegisterReportPdfService);

    register = input.required<CashRegister>();
    showExportButton = input<boolean>(true);
    /** Émis après une action (ex. PDF) pour fermer le slide parent. */
    actionDone = output<void>();

    totalIncome = computed(() => sumCashIncome(this.register()?.transactions));
    totalExpense = computed(() => sumCashBusinessExpenses(this.register()?.transactions));
    totalRefund = computed(() => sumCashRefunds(this.register()?.transactions));

    theoreticalBalance = computed(() => {
        const reg = this.register();
        if (!reg) return 0;
        const opening = Number(reg.opening_balance) || 0;
        return opening + this.totalIncome() - sumCashOutflows(reg.transactions);
    });

    isRefund = isCashRefund;

    downloadReportPdf(): void {
        const reg = this.register();
        if (!reg) return;
        this.reportPdf.exportSessionPdf(reg);
        this.actionDone.emit();
    }
}
