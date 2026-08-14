import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartOptions } from 'chart.js';
import type { DashboardBusinessGrowthMonth } from '../../models/dashboard.model';

@Component({
  selector: 'app-super-admin-businesses-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-sm h-full">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Croissance</h2>
          <p class="text-sm font-semibold text-gray-900 mt-0.5">Nouvelles entreprises</p>
        </div>
        <p class="text-xs font-medium text-gray-400">6 derniers mois</p>
      </div>
      <div class="h-56 md:h-64">
        <canvas baseChart [type]="'bar'" [data]="chartData" [options]="chartOptions"></canvas>
      </div>
    </div>
  `,
})
export class SuperAdminBusinessesChartComponent {
  @Input({ required: true }) months: DashboardBusinessGrowthMonth[] = [];

  get chartData() {
    return {
      labels: this.months.map((m) => m.label),
      datasets: [
        {
          label: 'Entreprises',
          data: this.months.map((m) => m.count),
          backgroundColor: 'rgba(0, 109, 119, 0.75)',
          borderColor: '#006d77',
          borderWidth: 1,
          borderRadius: 8,
          maxBarThickness: 36,
        },
      ],
    };
  }

  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };
}
