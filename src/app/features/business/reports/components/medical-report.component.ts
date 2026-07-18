import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { MedicalReport } from '../../models/report.model';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';
import { FormatPricePipe } from '../../../../core/pipes';

@Component({
    selector: 'app-medical-report',
    standalone: true,
    imports: [CommonModule, BaseChartDirective, FormatPricePipe],
    templateUrl: './medical-report.component.html'
})
export class MedicalReportComponent {
    @Input({ required: true }) data!: MedicalReport;
    strategyService = inject(BusinessStrategyService);

    get speciesChartData() {
        const d = this.data;
        if (!d?.by_species?.length) return { labels: [] as string[], datasets: [{ data: [] as number[], backgroundColor: [] as string[] }] };
        const labels = d.by_species.map(s => s.animal_species || 'Non renseigné');
        const data = d.by_species.map(s => s.count);
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
        return { labels, datasets: [{ data, backgroundColor: labels.map((_, i) => colors[i % colors.length]) }] };
    }

    speciesChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' as const } }
    };

    get monthlyChartData() {
        const d = this.data;
        if (!d?.monthly_volume?.length) return { labels: [] as string[], datasets: [] };
        const labels = d.monthly_volume.map(m => m.month);
        const data = d.monthly_volume.map(m => m.total);
        return {
            labels,
            datasets: [{ label: this.strategyService.isVet() ? 'Consultations' : 'Activité', data, borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.3 }]
        };
    }

    monthlyChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
    };

    getMaxVolume(): number {
        if (!this.data.monthly_volume || this.data.monthly_volume.length === 0) return 1;
        return Math.max(...this.data.monthly_volume.map(m => m.total)) || 1;
    }
}




