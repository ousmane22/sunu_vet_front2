import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPricePipe, FormatDatePipe } from '../../../../../core/pipes';
import type { CashRegister } from '../../../models';

@Component({
    selector: 'app-cash-register-history-table',
    standalone: true,
    imports: [CommonModule, FormatPricePipe, FormatDatePipe],
    templateUrl: './cash-register-history-table.component.html',
})
export class CashRegisterHistoryTableComponent {
    history = input.required<CashRegister[]>();
    isLoadingHistory = input<boolean>(false);
    /** Fonction pour le solde théorique d'une session (passée par le parent). */
    getTheoreticalFinal = input.required<(reg: CashRegister) => number>();
    /** Fonction pour l'écart d'une session (passée par le parent). */
    getDifference = input.required<(reg: CashRegister) => number>();

    openDetails      = output<CashRegister>();
    exportSessionPdf = output<CashRegister>();
    exportHistoryPdf = output<void>();
    correctBalance   = output<CashRegister>();
}




