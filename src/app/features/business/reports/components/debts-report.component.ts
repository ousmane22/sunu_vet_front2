import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { DebtsReport } from '../../models/report.model';
import { FormatPricePipe } from '../../../../core/pipes';
import { ReportPanelComponent } from '../shared/report-panel.component';
import { ReportEmptyStateComponent } from '../shared/report-empty-state.component';

const MIN_BALANCE_DISPLAY = 1;

@Component({
    selector: 'app-debts-report',
    standalone: true,
    imports: [CommonModule, FormatPricePipe, BaseChartDirective, ReportPanelComponent, ReportEmptyStateComponent],
    templateUrl: './debts-report.component.html',
})
export class DebtsReportComponent {
    @Input({ required: true }) data!: DebtsReport;

    get displayedDebtors() {
        const list = this.data.top_debtors ?? [];
        return list.filter((d) => Number(d.balance_due) >= MIN_BALANCE_DISPLAY);
    }

    get debtorCount(): number {
        return this.displayedDebtors.length ? this.data.debtors_count : 0;
    }

    get debtorsChartData() {
        const list = this.displayedDebtors;
        if (!list.length) return { labels: [] as string[], datasets: [{ label: 'Solde dû', data: [] as number[] }] };
        const labels = list.map((x) => (x.name.length > 18 ? x.name.slice(0, 18) + '…' : x.name));
        const values = list.map((x) => x.balance_due);
        return {
            labels,
            datasets: [{
                label: 'Solde dû',
                data: values,
                backgroundColor: 'rgba(220, 38, 38, 0.75)',
                borderRadius: 6,
                borderSkipped: false,
            }],
        };
    }

    debtorsChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        plugins: { legend: { display: false } },
        scales: {
            x: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.12)' } },
            y: { grid: { display: false } },
        },
    };
}
