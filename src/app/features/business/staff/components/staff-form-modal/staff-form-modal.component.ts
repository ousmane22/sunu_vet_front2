import { Component, input, output, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { StaffMember, StaffRoleOption } from '../../../models';

@Component({
  selector: 'app-staff-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './staff-form-modal.component.html',
})
export class StaffFormModalComponent {
  private fb = inject(FormBuilder);

  member = input<StaffMember | null>(null);
  roles = input.required<StaffRoleOption[]>();
  isSaving = input.required<boolean>();
  error = input<string | null>(null);

  save = output<any>();
  close = output<void>();

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    role: ['', [Validators.required]],
    password: [''],
    password_confirmation: [''],
  });

  constructor() {
    effect(() => {
      const m = this.member();
      if (m) {
        this.form.patchValue({
          name: m.name,
          email: m.email,
          role: m.role || (m.roles && m.roles[0]) || '',
          password: '',
          password_confirmation: '',
        });
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
      } else {
        this.form.reset({ name: '', email: '', role: '', password: '', password_confirmation: '' });
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.form.get('password')?.updateValueAndValidity();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSaving()) return;
    this.save.emit(this.form.getRawValue());
  }
}




