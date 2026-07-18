import { Component, inject, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import type { Client } from '../../../models';

@Component({
  selector: 'app-client-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-form-modal.component.html',
})
export class ClientFormModalComponent {
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);

  open   = input<boolean>(false);
  /** Null = création, Client = édition. */
  client = input<Client | null>(null);

  /** Émet le client créé ou mis à jour. */
  saved     = output<Client>();
  cancelled = output<void>();

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    phone:   [''],
    email:   ['', [Validators.email]],
    address: [''],
    notes:   [''],
  });

  constructor() {
    effect(() => {
      const c = this.client();
      if (c) {
        this.form.patchValue({
          name:    c.name,
          phone:   c.phone    ?? '',
          email:   c.email    ?? '',
          address: c.address  ?? '',
          notes:   c.notes    ?? '',
        });
      } else {
        this.form.reset({ name: '', phone: '', email: '', address: '', notes: '' });
      }
      this.errorMessage.set(null);
    });
  }

  get isEditMode(): boolean {
    return !!this.client();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    // getRawValue() retourne string|null ; Partial<Client> attend string|undefined
    const payload: Partial<Client> = {
      name:    raw.name    ?? undefined,
      phone:   raw.phone   ?? undefined,
      email:   raw.email   ?? undefined,
      address: raw.address ?? undefined,
      notes:   raw.notes   ?? undefined,
    };
    const c = this.client();
    const req = c
      ? this.clientService.update(c.id, payload)
      : this.clientService.create(payload);

    req.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.saved.emit(res.data);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.error?.message ?? 'Erreur lors de l\'enregistrement.'
        );
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
