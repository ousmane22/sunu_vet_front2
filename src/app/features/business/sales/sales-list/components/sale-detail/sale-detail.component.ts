import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPricePipe, FormatDatePipe } from '../../../../../../core/pipes';
import { DetailSlideOverComponent } from '../../../../../../shared/components/detail-slide-over/detail-slide-over.component';
import type { Sale } from '../../../../models';

@Component({
    selector: 'app-sale-detail',
    standalone: true,
    imports: [CommonModule, FormatPricePipe, FormatDatePipe, DetailSlideOverComponent],
    templateUrl: './sale-detail.component.html',
})
export class SaleDetailComponent {
    sale = input<Sale | null>(null);
    loading = input<boolean>(false);
    canDeposit = input<boolean>(false);
    canRefund = input<boolean>(false);

    close = output<void>();
    addPayment = output<Sale>();
    cancel = output<Sale>();
    printInvoice = output<Sale>();
    printReceipt = output<Sale>();

    discountLabel(sale: Sale): string {
        if (sale.discount_type === 'percent') {
            return `${sale.discount_value} %`;
        }
        if (sale.discount_type === 'amount') {
            return 'montant fixe';
        }
        return 'remise';
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-900 border-green-300';
            case 'partial': return 'bg-amber-100 text-amber-900 border-amber-300';
            case 'cancelled': return 'bg-red-100 text-red-900 border-red-300';
            default: return 'bg-gray-100 text-black border-gray-300';
        }
    }
}
