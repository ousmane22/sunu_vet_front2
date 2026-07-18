import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { StockReport } from '../../models/report.model';
import { FormatPricePipe } from '../../../../core/pipes';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';

@Component({
    selector: 'app-stock-report',
    standalone: true,
    imports: [CommonModule, FormatPricePipe, BaseChartDirective],
    templateUrl: './stock-report.component.html'
})
export class StockReportComponent {
    @Input({ required: true }) data!: StockReport;
    strategyService = inject(BusinessStrategyService);

    get topSellersChartData() {
        const d = this.data;
        if (!d?.top_sellers?.length) return { labels: [] as string[], datasets: [{ label: 'Vendus', data: [] as number[] }] };
        const labels = d.top_sellers.map(s => s.name.length > 18 ? s.name.slice(0, 18) + '…' : s.name);
        const data = d.top_sellers.map(s => s.total_sold);
        return { labels, datasets: [{ label: 'Unités vendues', data, backgroundColor: 'rgba(59, 130, 246, 0.6)' }] };
    }

    topSellersChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true } }
    };
}




