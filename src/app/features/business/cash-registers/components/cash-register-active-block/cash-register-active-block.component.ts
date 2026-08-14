import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPricePipe } from '../../../../../core/pipes';
import { sumCashNetIncome, sumCashRefunds } from '../../utils/cash-transaction.util';
import type { CashRegister } from '../../../models';

@Component({
    selector: 'app-cash-register-active-block',
    standalone: true,
    imports: [CommonModule, FormatPricePipe],
    templateUrl: './cash-register-active-block.component.html',
})
export class CashRegisterActiveBlockComponent {
    register = input.required<CashRegister>();
    theoreticalBalance = input.required<number>();

    openCloseModal = output<void>();
    openMovements = output<void>();

    /** Encaissé net (entrées − remboursements), aligné avec les rapports. */
    netIncomeToday = computed(() => sumCashNetIncome(this.register()?.transactions));

    refundsToday = computed(() => sumCashRefunds(this.register()?.transactions));

    openedAtLabel = computed(() => {
        const reg = this.register();
        const raw = reg?.date || reg?.created_at;
        if (!raw) return '';
        const d = new Date(raw);
        const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const date = d.toLocaleDateString('fr-FR');
        return `${time} · ${date}`;
    });

    elapsedLabel = computed(() => {
        const reg = this.register();
        const raw = reg?.date || reg?.created_at;
        if (!raw) return '';
        const start = new Date(raw).getTime();
        const mins = Math.max(0, Math.floor((Date.now() - start) / 60000));
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m} min`;
    });
}
