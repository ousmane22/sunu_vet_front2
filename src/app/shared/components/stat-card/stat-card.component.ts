import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type StatCardTheme = 'blue' | 'green' | 'purple' | 'amber' | 'indigo';

const THEME_CLASSES: Record<
  StatCardTheme,
  { iconBg: string; borderHover: string; suffixClass: string }
> = {
  blue: { iconBg: 'bg-blue-50 text-blue-600', borderHover: 'hover:border-blue-300', suffixClass: 'text-gray-400' },
  green: { iconBg: 'bg-green-50 text-green-600', borderHover: 'hover:border-green-300', suffixClass: 'text-gray-500' },
  purple: { iconBg: 'bg-purple-50 text-purple-600', borderHover: 'hover:border-purple-300', suffixClass: 'text-gray-500' },
  amber: { iconBg: 'bg-amber-50 text-amber-600', borderHover: 'hover:border-amber-300', suffixClass: 'text-amber-600 font-medium' },
  indigo: { iconBg: 'bg-indigo-50 text-indigo-600', borderHover: 'hover:border-indigo-300', suffixClass: 'text-gray-400' },
};

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="route()"
       class="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col justify-between hover:shadow-lg cursor-pointer hover:-translate-y-1 transition-all duration-300 h-full"
       [class]="classes.borderHover">
      <div class="flex items-center justify-between mb-2 md:mb-4">
        <h4 class="text-gray-500 font-medium text-xs md:text-sm uppercase tracking-wider">{{ label() }}</h4>
        <div class="p-2 rounded-lg" [class]="classes.iconBg">
          <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="iconPath()" />
          </svg>
        </div>
      </div>
      <div>
        <span class="text-xl md:text-3xl font-bold text-gray-900">{{ value() }}</span>
        <span *ngIf="suffix()" class="text-xs md:text-sm ml-1 md:ml-2" [class]="classes.suffixClass">{{ suffix() }}</span>
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
