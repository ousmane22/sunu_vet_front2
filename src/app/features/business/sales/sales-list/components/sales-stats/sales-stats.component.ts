import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPricePipe } from '../../../../../../core/pipes';

export type SalesPeriod = 'today' | 'week' | 'month' | 'custom';

@Component({
    selector: 'app-sales-stats',
    standalone: true,
    imports: [CommonModule, FormatPricePipe],
    templateUrl: './sales-stats.component.html',
})
export class SalesStatsComponent {
    statsToday = input({ amount: 0, count: 0 });
    statsWeek = input({ amount: 0 });
    statsMonth = input({ amount: 0 });
    selectedPeriod = input<SalesPeriod>('today');

    periodChange = output<SalesPeriod>();

    select(period: SalesPeriod): void {
        this.periodChange.emit(period);
    }
}
