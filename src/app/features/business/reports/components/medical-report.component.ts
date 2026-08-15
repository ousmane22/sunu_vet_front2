import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { MedicalReport } from '../../models/report.model';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';
import { FormatPricePipe } from '../../../../core/pipes';
import { ReportKpiCardComponent } from '../shared/report-kpi-card.component';
import { ReportPanelComponent } from '../shared/report-panel.component';
import { ReportEmptyStateComponent } from '../shared/report-empty-state.component';

@Component({
    selector: 'app-medical-report',
    standalone: true,
    imports: [CommonModule, BaseChartDirective, FormatPricePipe, ReportKpiCardComponent, ReportPanelComponent, ReportEmptyStateComponent],
    templateUrl: './medical-report.component.html',
})
export class MedicalReportComponent {
    @Input({ required: true }) data!: MedicalReport;
    strategyService = inject(BusinessStrategyService);

    get speciesChartData() {
        const d = this.data;
        if (!d?.by_species?.length) {
            return { labels: [] as string[], datasets: [{ data: [] as number[], backgroundColor: [] as string[], borderWidth: 0 }] };
        }
        const labels = d.by_species.map(s => s.animal_species || 'Non renseigné');
        const values = d.by_species.map(s => s.count);
        const colors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777', '#64748b'];
        return { labels, datasets: [{ data: values, backgroundColor: colors.slice(0, values.length), borderWidth: 0, hoverOffset: 6 }] };
    }

    speciesChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '58%',
        plugins: { legend: { display: false } },
    };

    get monthlyChartData() {
        const d = this.data;
        if (!d?.monthly_volume?.length) return { labels: [] as string[], datasets: [] };
        const labels = d.monthly_volume.map(m => m.month);
        const values = d.monthly_volume.map(m => m.total);
        return {
            labels,
            datasets: [{
                label: this.strategyService.isVet() ? 'Consultations' : 'Activité',
                data: values,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
            }],
        };
    }

    monthlyChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.12)' } },
            x: { grid: { display: false } },
        },
    };
}
