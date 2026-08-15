import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { PerformanceReport } from '../../models/report.model';
import { FormatPricePipe } from '../../../../core/pipes';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';
import { ReportKpiCardComponent } from '../shared/report-kpi-card.component';
import { ReportPanelComponent } from '../shared/report-panel.component';
import { ReportEmptyStateComponent } from '../shared/report-empty-state.component';

@Component({
    selector: 'app-performance-report',
    standalone: true,
    imports: [CommonModule, FormatPricePipe, BaseChartDirective, ReportKpiCardComponent, ReportPanelComponent, ReportEmptyStateComponent],
    templateUrl: './performance-report.component.html',
})
export class PerformanceReportComponent {
    @Input({ required: true }) data!: PerformanceReport;
    strategyService = inject(BusinessStrategyService);

    get collectionRate(): number {
        const net = this.data?.summary?.total_net ?? 0;
        const collected = this.data?.summary?.total_collected ?? 0;
        if (net <= 0) return collected > 0 ? 100 : 0;
        return Math.min(100, Math.round((collected / net) * 100));
    }

    get paymentChartData() {
        const d = this.data;
        if (!d?.payments?.length) {
            return { labels: [] as string[], datasets: [{ data: [] as number[], backgroundColor: [] as string[], borderWidth: 0 }] };
        }
        const labels = d.payments.map(p => this.getPaymentLabel(p.payment_method));
        const values = d.payments.map(p => p.total);
        const colors = ['#059669', '#2563eb', '#7c3aed'];
        return {
            labels,
            datasets: [{ data: values, backgroundColor: colors.slice(0, values.length), borderWidth: 0, hoverOffset: 6 }],
        };
    }

    paymentChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#0f172a', padding: 12, cornerRadius: 8 },
        },
    };

    get topArticlesChartData() {
        const d = this.data;
        if (!d?.top_articles?.length) {
            return { labels: [] as string[], datasets: [{ label: 'CA', data: [] as number[] }] };
        }
        const labels = d.top_articles.map(a => (a.name.length > 22 ? a.name.slice(0, 22) + '…' : a.name));
        const values = d.top_articles.map(a => a.total);
        return {
            labels,
            datasets: [{
                label: 'Chiffre d\'affaires',
                data: values,
                backgroundColor: 'rgba(37, 99, 235, 0.75)',
                borderRadius: 6,
                borderSkipped: false,
            }],
        };
    }

    topArticlesChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        plugins: { legend: { display: false } },
        scales: {
            x: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.15)' } },
            y: { grid: { display: false } },
        },
    };

    getPaymentLabel(method: string): string {
        const labels: Record<string, string> = {
            cash: 'Espèces',
            card: 'Carte',
            mobile_money: 'Mobile Money',
        };
        return labels[method] || method;
    }

    paymentColor(method: string): string {
        const map: Record<string, string> = {
            cash: 'bg-emerald-500',
            card: 'bg-blue-500',
            mobile_money: 'bg-violet-500',
        };
        return map[method] ?? 'bg-slate-400';
    }

    paymentShare(total: number): number {
        const sum = this.data.payments.reduce((a, p) => a + p.total, 0) || 1;
        return Math.round((total / sum) * 100);
    }
}
