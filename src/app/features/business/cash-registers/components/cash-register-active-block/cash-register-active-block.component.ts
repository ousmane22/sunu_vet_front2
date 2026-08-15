import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPricePipe } from '../../../../../core/pipes';
import { AuthService } from '../../../../auth/services/auth.service';
import { sumCashNetIncome, sumCashRefunds, sumIncomeByMethod } from '../../utils/cash-transaction.util';
import type { CashRegister } from '../../../models';

@Component({
    selector: 'app-cash-register-active-block',
    standalone: true,
    imports: [CommonModule, FormatPricePipe],
    templateUrl: './cash-register-active-block.component.html',
})
export class CashRegisterActiveBlockComponent {
    private auth = inject(AuthService);

    register = input.required<CashRegister>();
    theoreticalBalance = input.required<number>();

    openCloseModal = output<void>();
    openMovements = output<void>();

    isOwnRegister = computed(() => {
        const reg = this.register();
        const userId = this.auth.currentUser()?.id;
        return !!reg?.user?.id && reg.user.id === userId;
    });

    cashierLabel = computed(() => this.register()?.user?.name ?? 'Caissier');

    /** Encaissé net (entrées − remboursements), aligné avec les rapports. */
    netIncomeToday = computed(() => sumCashNetIncome(this.register()?.transactions));

    refundsToday = computed(() => sumCashRefunds(this.register()?.transactions));

    cashIncomeToday = computed(() => sumIncomeByMethod(this.register()?.transactions, 'cash'));
    cardIncomeToday = computed(() => sumIncomeByMethod(this.register()?.transactions, 'card'));
    mobileIncomeToday = computed(() => sumIncomeByMethod(this.register()?.transactions, 'mobile_money'));

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
