import { Component, input } from '@angular/core';

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [],
  template: `
    <div [class]="baseClasses + ' ' + typeClasses[type()]" class="animate-fade-in flex items-start">
      @if (type() === 'danger') {
        <svg class="h-5 w-5 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
      @if (type() === 'success') {
        <svg class="h-5 w-5 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      }
      <span class="text-sm font-medium"><ng-content></ng-content></span>
    </div>
  `
})
export class AlertComponent {
  type = input<AlertType>('info');

  baseClasses = 'mb-6 p-4 rounded-xl border';

  typeClasses: Record<AlertType, string> = {
    danger: 'bg-red-50 border-red-100 text-red-700',
    success: 'bg-green-50 border-green-100 text-green-700',
    warning: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    info: 'bg-blue-50 border-blue-100 text-blue-700'
  };
}


