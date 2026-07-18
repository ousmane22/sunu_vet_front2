import { Component, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Business } from '../../models';
import { BusinessService } from '../../services/business.service';

/**
 * Generic, reusable business form for create AND edit.
 * Pass [business] to enable edit mode with pre-filled fields.
 * Emits (saved) on success, (cancelled) on cancel.
 */
@Component({
  selector: 'app-business-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './business-modal.component.html',
})
export class BusinessModalComponent {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);

  // ---- Inputs ----
  /** Pass a business for edit mode, leave empty for create mode */
  business = input<Business | null>(null);

  // ---- Outputs ----
  saved = output<void>();
  cancelled = output<void>();

  // ---- State ----
  isSubmitting = false;
  serverError: string | null = null;
  currentStep = 1;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    country: ['Sénégal', [Validators.required]],
    business_type: ['veterinary', [Validators.required]],
    admin_email: ['', [Validators.email]],
    admin_password: ['', []],
  });

  // Runs once when input changes (populate form for edit)
  private _ = effect(() => {
    const c = this.business();
    if (c) {
      this.form.patchValue({
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        city: c.city,
        country: c.country,
        business_type: c.business_type,
      });
      // admin_email / admin_password not required in edit
      this.f.admin_email.clearValidators();
      this.f.admin_password.clearValidators();
      this.f.admin_email.updateValueAndValidity();
      this.f.admin_password.updateValueAndValidity();
    } else {
      // Create mode — admin is required
      this.f.admin_email.setValidators([Validators.required, Validators.email]);
      this.f.admin_password.setValidators([Validators.required, Validators.minLength(8)]);
      this.f.admin_email.updateValueAndValidity();
      this.f.admin_password.updateValueAndValidity();
    }
  });

  get isEditMode(): boolean { return !!this.business(); }
  get f() { return this.form.controls; }

  get step1Fields() {
    return ['name', 'email', 'phone', 'address', 'city', 'country', 'business_type'];
  }

  get isStep1Valid(): boolean {
    return this.step1Fields.every(k => this.form.get(k)!.valid);
  }

  nextStep() {
    if (this.isStep1Valid) {
      this.currentStep = 2;
    } else {
      this.step1Fields.forEach(k => this.form.get(k)!.markAsTouched());
    }
  }

  prevStep() { this.currentStep = 1; }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isSubmitting = true;
    this.serverError = null;

    const payload = this.form.value as any;
    const obs = this.isEditMode
      ? this.businessService.updateBusiness(this.business()!.id, payload)
      : this.businessService.createBusiness(payload);

    obs.subscribe({
      next: () => { this.isSubmitting = false; this.saved.emit(); },
      error: (err) => {
        this.isSubmitting = false;
        const errors = err.error?.errors;
        this.serverError = errors
          ? (Object.values(errors).flat()[0] as string)
          : (err.error?.message ?? 'Une erreur est survenue.');
      }
    });
  }

  hasError(ctrl: AbstractControl | null): boolean {
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  cancel() { this.cancelled.emit(); }
}




