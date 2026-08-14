import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPricePipe, FormatDatePipe } from '../../../../../core/pipes';
import type { Consultation } from '../../../models';

@Component({
  selector: 'app-consultations-table',
  standalone: true,
  imports: [CommonModule, FormatPricePipe, FormatDatePipe],
  templateUrl: './consultations-table.component.html',
})
export class ConsultationsTableComponent {
  consultations = input.required<Consultation[]>();
  canDelete     = input<boolean>(false);
  canEdit       = input<boolean>(false);

  viewDetails = output<Consultation>();
  edit        = output<Consultation>();
  cancel      = output<Consultation>();

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed': return 'Réglée';
      case 'partial': return 'Partiel';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  }

  statusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200';
      case 'partial': return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200';
      case 'cancelled': return 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';
      default: return 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';
    }
  }

  clientInitial(c: Consultation): string {
    const name = c.client?.name?.trim();
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }
}
