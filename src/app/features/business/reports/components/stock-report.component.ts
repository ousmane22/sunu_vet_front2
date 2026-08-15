import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { StockReport } from '../../models/report.model';
import { FormatPricePipe } from '../../../../core/pipes';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';
import { ReportKpiCardComponent } from '../shared/report-kpi-card.component';
import { ReportPanelComponent } from '../shared/report-panel.component';
import { ReportEmptyStateComponent } from '../shared/report-empty-state.component';

@Component({
    selector: 'app-stock-report',
    standalone: true,
    imports: [CommonModule, FormatPricePipe, BaseChartDirective, ReportKpiCardComponent, ReportPanelComponent, ReportEmptyStateComponent],
    templateUrl: './stock-report.component.html',
})
export class StockReportComponent {
    @Input({ required: true }) data!: StockReport;
    strategyService = inject(BusinessStrategyService);

    get topSellersChartData() {
        const d = this.data;
        if (!d?.top_sellers?.length) {
            return { labels: [] as string[], datasets: [{ label: 'Vendus', data: [] as number[] }] };
        }
        const labels = d.top_sellers.map(s => (s.name.length > 20 ? s.name.slice(0, 20) + '…' : s.name));
        const values = d.top_sellers.map(s => s.total_sold);
        return {
            labels,
            datasets: [{
                label: 'Unités vendues',
                data: values,
                backgroundColor: 'rgba(5, 150, 105, 0.75)',
                borderRadius: 6,
                borderSkipped: false,
            }],
        };
    }

    topSellersChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        plugins: { legend: { display: false } },
        scales: {
            x: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.15)' } },
            y: { grid: { display: false } },
        },
    };
}
