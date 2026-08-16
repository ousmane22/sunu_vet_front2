import { Component, input, output, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormatPricePipe, FormatDatePipe } from '../../../../../core/pipes';
import { DetailSlideOverComponent } from '../../../../../shared/components/detail-slide-over/detail-slide-over.component';
import type { Consultation } from '../../../models';
import { animalDisplayName } from '../../../utils/animal-display.util';

@Component({
  selector: 'app-consultation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormatPricePipe, FormatDatePipe, DetailSlideOverComponent],
  templateUrl: './consultation-detail.component.html',
})
export class ConsultationDetailComponent {
  consultation = input<Consultation | null>(null);
  loading = input<boolean>(false);
  canAddPayment = input<boolean>(false);
  canEdit       = input<boolean>(false);
  canCancel     = input<boolean>(false);

  close      = output<void>();
  edit       = output<Consultation>();
  addPayment = output<Consultation>();
  cancel     = output<Consultation>();

  open = computed(() => !!this.consultation() || this.loading());
  detailTitle = computed(() => this.consultation() ? `Consultation #${this.consultation()!.id}` : '');

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed': return 'Réglée';
      case 'partial': return 'Partiel';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'partial': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'cancelled': return 'bg-red-100 text-red-900 border-red-300';
      default: return 'bg-gray-100 text-black border-gray-300';
    }
  }

  displayAnimalName(animal: NonNullable<Consultation['animal']>): string {
    return animalDisplayName(animal);
  }
}
