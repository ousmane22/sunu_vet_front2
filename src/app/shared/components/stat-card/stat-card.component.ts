import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type StatCardTheme = 'blue' | 'green' | 'purple' | 'amber' | 'indigo' | 'danger';

const THEME_CLASSES: Record<
  StatCardTheme,
  { iconBg: string; borderHover: string; suffixClass: string; valueClass: string }
> = {
  blue: { iconBg: 'bg-primary-50 text-primary-700', borderHover: 'hover:border-primary-200', suffixClass: 'text-gray-500', valueClass: 'text-gray-900' },
  green: { iconBg: 'bg-primary-50 text-primary-700', borderHover: 'hover:border-primary-200', suffixClass: 'text-gray-500', valueClass: 'text-gray-900' },
  purple: { iconBg: 'bg-primary-50 text-primary-700', borderHover: 'hover:border-primary-200', suffixClass: 'text-gray-500', valueClass: 'text-gray-900' },
  amber: { iconBg: 'bg-amber-50 text-amber-600', borderHover: 'hover:border-amber-300', suffixClass: 'text-amber-700 font-medium', valueClass: 'text-amber-700' },
  indigo: { iconBg: 'bg-primary-50 text-primary-700', borderHover: 'hover:border-primary-200', suffixClass: 'text-gray-500', valueClass: 'text-gray-900' },
  danger: { iconBg: 'bg-red-50 text-red-600', borderHover: 'hover:border-red-200', suffixClass: 'text-red-600 font-medium', valueClass: 'text-red-600' },
};

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="route()"
       class="block bg-white rounded-xl border border-gray-200 p-4 md:p-5 flex flex-col justify-between hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all duration-200 h-full"
       [class]="classes.borderHover">
      <div class="flex items-start justify-between gap-2 mb-3">
        <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-wider leading-tight">{{ label() }}</h4>
        <div class="p-1.5 rounded-lg shrink-0" [class]="classes.iconBg">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="iconPath()" />
          </svg>
        </div>
      </div>
      <div class="flex items-baseline gap-1.5 flex-wrap">
        <span class="text-2xl md:text-3xl font-bold tabular-nums leading-none" [class]="classes.valueClass">{{ value() }}</span>
        @if (suffix()) {
        <span class="text-xs font-medium text-gray-500">{{ suffix() }}</span>
        }
      </div>
    </a>
  `,
})
export class StatCardComponent {
  label = input.required<string>();
  route = input<string | string[]>('');
  value = input.required<string | number>();
  suffix = input<string>('');
  iconPath = input.required<string>();
  theme = input<StatCardTheme>('blue');

  protected get classes() {
    return THEME_CLASSES[this.theme()] ?? THEME_CLASSES.blue;
  }
}
