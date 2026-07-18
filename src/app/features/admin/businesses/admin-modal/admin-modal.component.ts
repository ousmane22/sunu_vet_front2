import { Component, inject, input, output, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BusinessService } from '../../services/business.service';
import { User } from '../../models';

@Component({
  selector: 'app-admin-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-modal.component.html',
})
export class AdminModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);

  businessId = input.required<number>();
  admin = input<User | null>(null);     // null → create mode
  saved = output<void>();
  cancelled = output<void>();

  get isEditMode() { return !!this.admin(); }

  isSubmitting = false;
  serverError: string | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],   // optional in edit mode
  });

  ngOnInit() {
    const a = this.admin();
    if (a) {
      this.form.patchValue({ name: a.name, email: a.email });
      this.form.get('password')!.clearValidators();
      this.form.get('password')!.updateValueAndValidity();
    } else {
      this.form.get('password')!.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.get('password')!.updateValueAndValidity();
    }
  }

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting = true;
    this.serverError = null;

    const payload = { ...this.form.value };
    if (this.isEditMode && !payload.password) delete payload.password;

    const request$ = this.isEditMode
      ? this.businessService.updateAdmin(this.businessId(), this.admin()!.id, payload)
      : this.businessService.addAdmin(this.businessId(), payload);

    request$.subscribe({
      next: () => { this.isSubmitting = false; this.saved.emit(); },
      error: (err) => {
        this.isSubmitting = false;
        const errors = err.error?.errors;
        this.serverError = errors
          ? (Object.values(errors).flat()[0] as string)
          : (err.error?.message ?? 'Erreur inattendue.');
      }
    });
  }

  cancel() { this.cancelled.emit(); }
}




