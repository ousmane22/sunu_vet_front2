import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPricePipe } from '../../../../core/pipes';
import { CashRegisterReportPdfService } from '../services/cash-register-report-pdf.service';
import {
    isCashRefund,
    paymentMethodLabel,
    sumCashBusinessExpenses,
    sumCashIncome,
    sumCashRefunds,
    sumPhysicalCashTheoreticalBalance,
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

    /** Journal des opérations, la plus récente en premier. */
    sortedTransactions = computed(() => {
        const transactions = this.register()?.transactions;
        if (!transactions) return [];
        return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    totalIncome = computed(() => sumCashIncome(this.register()?.transactions));
    totalExpense = computed(() => sumCashBusinessExpenses(this.register()?.transactions));
    totalRefund = computed(() => sumCashRefunds(this.register()?.transactions));

    theoreticalBalance = computed(() => {
        const reg = this.register();
        if (!reg) return 0;
        return sumPhysicalCashTheoreticalBalance(reg.opening_balance, reg.transactions);
    });

    isRefund = isCashRefund;
    paymentMethodLabel = paymentMethodLabel;

    downloadReportPdf(): void {
        const reg = this.register();
        if (!reg) return;
        this.reportPdf.exportSessionPdf(reg);
        this.actionDone.emit();
    }
}
