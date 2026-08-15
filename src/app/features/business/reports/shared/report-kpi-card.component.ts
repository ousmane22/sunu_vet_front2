import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-report-kpi-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div
        class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 border-l-4 transition-shadow hover:shadow-md"
        [class]="accentClass()"
    >
        <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
                <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">{{ label() }}</p>
                <p class="mt-1.5 text-2xl md:text-[1.65rem] font-black text-slate-900 leading-tight truncate">{{ value() }}</p>
                @if (hint()) {
                <p class="mt-2 text-xs font-medium text-slate-500 leading-snug">{{ hint() }}</p>
                }
                @if (badge()) {
                <p class="mt-2 inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold" [class]="badgeClass()">{{ badge() }}</p>
                }
            </div>
            @if (icon()) {
            <div class="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg" [class]="iconClass()">
                <i [class]="icon()"></i>
            </div>
            }
        </div>
    </div>
    `,
})
export class ReportKpiCardComponent {
    label = input.required<string>();
    value = input.required<string>();
    hint = input<string>('');
    badge = input<string>('');
    icon = input<string>('');
    accent = input<'emerald' | 'blue' | 'violet' | 'rose' | 'amber' | 'slate' | 'primary'>('slate');

    accentClass = () => {
        const map: Record<string, string> = {
            emerald: 'border-l-emerald-500',
            blue: 'border-l-blue-500',
            violet: 'border-l-violet-500',
            rose: 'border-l-rose-500',
            amber: 'border-l-amber-500',
            slate: 'border-l-slate-500',
            primary: 'border-l-primary-600',
        };
        return map[this.accent()] ?? map['slate'];
    };

    iconClass = () => {
        const map: Record<string, string> = {
            emerald: 'bg-emerald-50 text-emerald-600',
            blue: 'bg-blue-50 text-blue-600',
            violet: 'bg-violet-50 text-violet-600',
            rose: 'bg-rose-50 text-rose-600',
            amber: 'bg-amber-50 text-amber-600',
            slate: 'bg-slate-100 text-slate-600',
            primary: 'bg-primary-50 text-primary-600',
        };
        return map[this.accent()] ?? map['slate'];
    };

    badgeClass = () => {
        const map: Record<string, string> = {
            emerald: 'bg-emerald-50 text-emerald-800',
            blue: 'bg-blue-50 text-blue-800',
            violet: 'bg-violet-50 text-violet-800',
            rose: 'bg-rose-50 text-rose-800',
            amber: 'bg-amber-50 text-amber-800',
            slate: 'bg-slate-100 text-slate-700',
            primary: 'bg-primary-50 text-primary-800',
        };
        return map[this.accent()] ?? map['slate'];
    };
}
