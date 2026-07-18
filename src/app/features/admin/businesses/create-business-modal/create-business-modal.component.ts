import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { BusinessService } from '../../services/business.service';

@Component({
  selector: 'app-create-business-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-business-modal.component.html',
  styleUrl: './create-business-modal.component.scss'
})
export class CreateBusinessModalComponent {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);

  // Outputs
  closed = output<void>();
  created = output<void>();

  isSubmitting = signal(false);
  serverError = signal<string | null>(null);
  currentStep = signal(1);

  form = this.fb.group({
    // Step 1 — Informations de la entreprise
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    country: ['Sénégal', [Validators.required]],
    // Step 2 — Compte Administrateur
    admin_email: ['', [Validators.required, Validators.email]],
    admin_password: ['', [Validators.required, Validators.minLength(8)]],
  });

  get f() {
    return this.form.controls;
  }

  get isStep1Valid(): boolean {
    return this.f.name.valid && this.f.email.valid && this.f.phone.valid &&
      this.f.address.valid && this.f.city.valid && this.f.country.valid;
  }

  nextStep() {
    if (this.isStep1Valid) {
      this.currentStep.set(2);
    } else {
      // Mark step 1 fields as touched
      ['name', 'email', 'phone', 'address', 'city', 'country'].forEach(field => {
        this.form.get(field)?.markAsTouched();
      });
    }
  }

  prevStep() {
    this.currentStep.set(1);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.serverError.set(null);

    this.businessService.createBusiness(this.form.value as any).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.created.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errors = err.error?.errors;
        if (errors) {
          const firstError = Object.values(errors).flat()[0] as string;
          this.serverError.set(firstError);
        } else {
          this.serverError.set(err.error?.message ?? 'Une erreur est survenue.');
        }
      }
    });
  }

  hasError(ctrl: AbstractControl | null): boolean {
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  close() {
    this.closed.emit();
  }
}




