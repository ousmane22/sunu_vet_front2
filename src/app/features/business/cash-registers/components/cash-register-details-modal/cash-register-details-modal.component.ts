import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailSlideOverComponent } from '../../../../../shared/components/detail-slide-over/detail-slide-over.component';
import { FormatDatePipe } from '../../../../../core/pipes';
import { CashRegisterDetailsComponent } from '../cash-register-details.component';
import type { CashRegister } from '../../../models';

@Component({
    selector: 'app-cash-register-details-modal',
    standalone: true,
    imports: [CommonModule, DetailSlideOverComponent, FormatDatePipe, CashRegisterDetailsComponent],
    templateUrl: './cash-register-details-modal.component.html',
})
export class CashRegisterDetailsModalComponent {
    register = input<CashRegister | null>(null);
    close = output<void>();

    subtitle = computed(() => {
        const reg = this.register();
        if (!reg) return null;
        const caissier = reg.user?.name ?? '—';
        return `${caissier} · ${reg.status === 'open' ? 'Session ouverte' : 'Session fermée'}`;
    });
}
