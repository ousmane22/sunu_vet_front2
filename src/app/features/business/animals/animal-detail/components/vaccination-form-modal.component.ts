import { Component, inject, signal, input, output, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { VaccinationService } from '../../../services/vaccination.service';
import { VaccineTypeService } from '../../../services/vaccine-type.service';
import type { VaccineType, Vaccination } from '../../../models';

type PaymentMethod = 'cash' | 'card' | 'mobile_money';

@Component({
  selector: 'app-vaccination-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vaccination-form-modal.component.html',
})
export class VaccinationFormModalComponent implements OnDestroy {
  private vaccinationService = inject(VaccinationService);
  private vaccineTypeService = inject(VaccineTypeService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  open = input<boolean>(false);
  animalId = input.required<number>();
  presetClientId = input<number | null>(null);
  vaccination = input<Vaccination | null>(null);

  get isEditMode(): boolean {
    return !!this.vaccination();
  }

  saved = output<void>();
  cancelled = output<void>();

  vaccineTypes = signal<VaccineType[]>([]);
  referenceLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  discountPanelOpen = signal(false);

  todayIso = new Date().toISOString().slice(0, 10);

  form = this.fb.group({
    vaccine_type_id: [null as number | null],
    vaccine_name: [''],
    administered_at: [this.todayIso, Validators.required],
    next_due_at: [''],
    notes: [''],
    total_amount: [0 as number, [Validators.required, Validators.min(0)]],
    amount_paid: [0 as number, [Validators.required, Validators.min(0)]],
    payment_method: ['cash' as PaymentMethod, Validators.required],
    discount_type: ['amount' as 'amount' | 'percent' | null],
    discount_value: [0 as number],
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.loadVaccineTypes();
        const v = this.vaccination();
        this.form.reset({
          vaccine_type_id: v?.vaccine_type_id ?? null,
          vaccine_name: v?.vaccine_name ?? '',
          administered_at: v?.administered_at?.slice(0, 10) ?? this.todayIso,
          next_due_at: v?.next_due_at?.slice(0, 10) ?? '',
          notes: v?.notes ?? '',
          total_amount: v?.total_amount ?? 0,
          amount_paid: v?.amount_paid ?? 0,
          payment_method: (v?.payment_method as PaymentMethod) ?? 'cash',
          discount_type: 'amount',
          discount_value: 0,
        });
        this.discountPanelOpen.set(false);
        this.errorMessage.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadVaccineTypes(): void {
    this.referenceLoading.set(true);
    this.vaccineTypeService.getAll().subscribe({
      next: (res) => {
        this.vaccineTypes.set(res.data ?? []);
        this.referenceLoading.set(false);
      },
      error: () => this.referenceLoading.set(false),
    });
  }

  setExactAmount(): void {
    this.form.patchValue({ amount_paid: Number(this.form.get('total_amount')?.value ?? 0) });
  }

  toggleDiscountPanel(): void {
    this.discountPanelOpen.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (!raw.vaccine_type_id && !raw.vaccine_name?.trim()) {
      this.errorMessage.set('Précisez un type de vaccin ou un nom de vaccin.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const onError = (err: any) => {
      this.isSubmitting.set(false);
      const errors = err.error?.errors;
      this.errorMessage.set(
        errors?.vaccine_name?.[0] ?? errors?.next_due_at?.[0] ?? errors?.client_id?.[0] ?? err.error?.message ?? 'Erreur lors de l\'enregistrement.'
      );
    };

    const editing = this.vaccination();
    if (editing) {
      this.vaccinationService.update(editing.id, {
        vaccine_type_id: raw.vaccine_type_id ?? undefined,
        vaccine_name: raw.vaccine_name?.trim() || undefined,
        administered_at: raw.administered_at ?? this.todayIso,
        next_due_at: raw.next_due_at || undefined,
        notes: raw.notes || undefined,
      }).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.saved.emit();
        },
        error: onError,
      });
      return;
    }

    this.vaccinationService.create({
      animal_id: this.animalId(),
      client_id: this.presetClientId() ?? undefined,
      vaccine_type_id: raw.vaccine_type_id ?? undefined,
      vaccine_name: raw.vaccine_name?.trim() || undefined,
      administered_at: raw.administered_at ?? this.todayIso,
      next_due_at: raw.next_due_at || undefined,
      notes: raw.notes || undefined,
      total_amount: Number(raw.total_amount),
      amount_paid: Number(raw.amount_paid),
      payment_method: raw.payment_method ?? 'cash',
      discount_type: this.discountPanelOpen() ? raw.discount_type : null,
      discount_value: this.discountPanelOpen() ? Number(raw.discount_value ?? 0) : 0,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: onError,
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
