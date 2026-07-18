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
      case 'completed': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'partial': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'cancelled': return 'bg-gray-100 text-black border-gray-300';
      default: return 'bg-gray-100 text-black border-gray-300';
    }
  }
}
