import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-report-panel',
    standalone: true,
    imports: [CommonModule],
    template: `
    <section class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 overflow-hidden">
        <header class="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white flex items-start justify-between gap-3">
            <div class="min-w-0">
                <h3 class="text-base font-black text-slate-900 tracking-tight">{{ title() }}</h3>
                @if (subtitle()) {
                <p class="mt-0.5 text-xs font-medium text-slate-500">{{ subtitle() }}</p>
                }
            </div>
            @if (icon()) {
            <div class="shrink-0 w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                <i [class]="icon()"></i>
            </div>
            }
        </header>
        <div class="p-5" [class]="bodyClass()">
            <ng-content />
        </div>
    </section>
    `,
})
export class ReportPanelComponent {
    title = input.required<string>();
    subtitle = input<string>('');
    icon = input<string>('');
    bodyClass = input<string>('');
}
