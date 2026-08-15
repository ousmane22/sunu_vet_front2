import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-report-empty-state',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mb-3">
            <i [class]="icon()"></i>
        </div>
        <p class="text-sm font-semibold text-slate-600">{{ message() }}</p>
    </div>
    `,
})
export class ReportEmptyStateComponent {
    message = input('Aucune donnée sur cette période.');
    icon = input('fas fa-chart-bar');
}
