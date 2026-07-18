import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { PerformanceReport } from '../../models/report.model';
import { FormatPricePipe } from '../../../../core/pipes';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';

@Component({
    selector: 'app-performance-report',
    standalone: true,
    imports: [CommonModule, FormatPricePipe, BaseChartDirective],
    templateUrl: './performance-report.component.html'
})
export class PerformanceReportComponent {
    @Input({ required: true }) data!: PerformanceReport;
    strategyService = inject(BusinessStrategyService);

    get paymentChartData() {
        const d = this.data;
        if (!d?.payments?.length) return { labels: [] as string[], datasets: [{ data: [] as number[], backgroundColor: [] as string[] }] };
        const labels = d.payments.map(p => this.getPaymentLabel(p.payment_method));
        const data = d.payments.map(p => p.total);
        const colors = ['#10b981', '#3b82f6', '#8b5cf6'];
        return { labels, datasets: [{ data, backgroundColor: labels.map((_, i) => colors[i % colors.length]) }] };
    }

    paymentChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' as const } }
    };

    get topArticlesChartData() {
        const d = this.data;
        if (!d?.top_articles?.length) return { labels: [] as string[], datasets: [{ label: 'Quantité', data: [] as number[] }] };
        const labels = d.top_articles.map(a => a.name.length > 20 ? a.name.slice(0, 20) + '…' : a.name);
        const data = d.top_articles.map(a => a.qty);
        return { labels, datasets: [{ label: 'Quantité vendue', data, backgroundColor: 'rgba(59, 130, 246, 0.6)' }] };
    }

    topArticlesChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true } }
    };

    getPaymentLabel(method: string): string {
        const labels: Record<string, string> = {
            'cash': '💵 Espèces',
            'card': '💳 Carte Bancaire',
            'mobile_money': '📱 Mobile Money (Wave/OM)',
        };
        return labels[method] || method;
    }
}
