import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { TreasuryReport } from '../../models/report.model';
import { FormatPricePipe } from '../../../../core/pipes';
import { ReportKpiCardComponent } from '../shared/report-kpi-card.component';
import { ReportPanelComponent } from '../shared/report-panel.component';
import { ReportEmptyStateComponent } from '../shared/report-empty-state.component';

@Component({
    selector: 'app-treasury-report',
    standalone: true,
    imports: [CommonModule, FormatPricePipe, BaseChartDirective, ReportKpiCardComponent, ReportPanelComponent, ReportEmptyStateComponent],
    templateUrl: './treasury-report.component.html',
})
export class TreasuryReportComponent {
    @Input({ required: true }) data!: TreasuryReport;

    get expensesChartData() {
        const d = this.data;
        if (!d?.expenses_by_category?.length) {
            return { labels: [] as string[], datasets: [{ data: [] as number[], backgroundColor: [] as string[], borderWidth: 0 }] };
        }
        const labels = d.expenses_by_category.map(c => this.getCategoryLabel(c.category));
        const values = d.expenses_by_category.map(c => c.total);
        const colors = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#64748b'];
        return { labels, datasets: [{ data: values, backgroundColor: colors.slice(0, values.length), borderWidth: 0, hoverOffset: 6 }] };
    }

    expensesChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '58%',
        plugins: { legend: { display: false } },
    };

    getCategoryLabel(cat: string): string {
        const labels: Record<string, string> = {
            achats: 'Achats stock',
            salaires: 'Salaires',
            factures: 'Factures fixes',
            entretien: 'Entretien',
            remboursements: 'Remboursements',
            autres: 'Autres',
        };
        return labels[cat] || cat;
    }

    expenseShare(total: number): number {
        return Math.round((total / (this.data.total_expenses || 1)) * 100);
    }
}
