import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { TreasuryReport } from '../../models/report.model';
import { FormatPricePipe } from '../../../../core/pipes';

@Component({
    selector: 'app-treasury-report',
    standalone: true,
    imports: [CommonModule, FormatPricePipe, BaseChartDirective],
    templateUrl: './treasury-report.component.html'
})
export class TreasuryReportComponent {
    @Input({ required: true }) data!: TreasuryReport;

    get expensesChartData() {
        const d = this.data;
        if (!d?.expenses_by_category?.length) return { labels: [] as string[], datasets: [{ data: [] as number[], backgroundColor: [] as string[] }] };
        const labels = d.expenses_by_category.map(c => this.getCategoryLabel(c.category));
        const data = d.expenses_by_category.map(c => c.total);
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
        return { labels, datasets: [{ data, backgroundColor: labels.map((_, i) => colors[i % colors.length]) }] };
    }

    expensesChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' as const } }
    };

    getCategoryLabel(cat: string): string {
        const labels: Record<string, string> = {
            'achats': '📦 Achats',
            'salaires': '👥 Salaires',
            'factures': '🏢 Factures',
            'entretien': '🛠️ Entretien',
            'remboursements': '💸 Remboursements',
            'autres': '➖ Autres'
        };
        return labels[cat] || cat;
    }
}




