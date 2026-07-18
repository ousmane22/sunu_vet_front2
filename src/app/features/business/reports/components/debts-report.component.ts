import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { DebtsReport } from '../../models/report.model';
import { FormatPricePipe } from '../../../../core/pipes';

/** Seuil en CFA : en dessous on considère qu’il n’y a pas de créance (unité minimale = 1). */
const MIN_BALANCE_DISPLAY = 1;

@Component({
    selector: 'app-debts-report',
    standalone: true,
    imports: [CommonModule, FormatPricePipe, BaseChartDirective],
    templateUrl: './debts-report.component.html'
})
export class DebtsReportComponent {
    @Input({ required: true }) data!: DebtsReport;

    /** Débiteurs avec solde dû significatif (exclut 0 et résidus d’arrondi). */
    get displayedDebtors() {
        const list = this.data.top_debtors ?? [];
        return list.filter((d) => Number(d.balance_due) >= MIN_BALANCE_DISPLAY);
    }

    get debtorsChartData() {
        const list = this.displayedDebtors;
        if (!list.length) return { labels: [] as string[], datasets: [{ label: 'Solde dû', data: [] as number[] }] };
        const labels = list.map((x) => (x.name.length > 20 ? x.name.slice(0, 20) + '…' : x.name));
        const data = list.map((x) => x.balance_due);
        return { labels, datasets: [{ label: 'Solde dû (CFA)', data, backgroundColor: 'rgba(239, 68, 68, 0.6)' }] };
    }

    debtorsChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true } }
    };
}




