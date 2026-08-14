import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartOptions, TooltipItem } from 'chart.js';
import type { DashboardRevenueDay } from '../../models/dashboard.model';
import { formatPrice } from '../../../../core/utils/format.util';

@Component({
  selector: 'app-super-admin-revenue-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-sm h-full">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Revenus plateforme</h2>
          <p class="text-sm font-semibold text-gray-900 mt-0.5">7 derniers jours</p>
        </div>
        <p class="text-xs font-medium text-gray-400">Abonnements encaissés</p>
      </div>
      <div class="h-56 md:h-64">
        <canvas baseChart [type]="'line'" [data]="chartData" [options]="chartOptions"></canvas>
      </div>
    </div>
  `,
})
export class SuperAdminRevenueChartComponent {
  @Input({ required: true }) days: DashboardRevenueDay[] = [];

  get chartData() {
    return {
      labels: this.days.map((d) => d.label),
      datasets: [
        {
          label: 'Revenu',
          data: this.days.map((d) => d.amount),
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124, 58, 237, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#7c3aed',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    };
  }

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'line'>) => formatPrice(ctx.parsed.y ?? 0),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatPrice(Number(value)),
          maxTicksLimit: 5,
        },
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };
}
