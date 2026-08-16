import { Component, inject, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HospitalizationService } from '../../../services/hospitalization.service';
import type { Hospitalization } from '../../../models';

@Component({
  selector: 'app-discharge-hospitalization-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './discharge-hospitalization-modal.component.html',
})
export class DischargeHospitalizationModalComponent {
  private hospitalizationService = inject(HospitalizationService);
  private fb = inject(FormBuilder);

  hospitalization = input<Hospitalization | null>(null);

  saved = output<void>();
  cancelled = output<void>();

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    discharge_summary: [''],
    total_amount: [null as number | null],
  });

  constructor() {
    effect(() => {
      const h = this.hospitalization();
      if (h) {
        this.form.reset({ discharge_summary: '', total_amount: h.total_amount });
        this.errorMessage.set(null);
      }
    });
  }

  onSubmit(): void {
    const h = this.hospitalization();
    if (!h || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const payload: { discharge_summary?: string; total_amount?: number } = {
      discharge_summary: raw.discharge_summary || undefined,
    };
    if (raw.total_amount != null && Number(raw.total_amount) !== h.total_amount) {
      payload.total_amount = Number(raw.total_amount);
    }

    this.hospitalizationService.discharge(h.id, payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message ?? 'Erreur lors de la clôture.');
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
