import { Component, inject, signal, input, output, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { HospitalizationService } from '../../../services/hospitalization.service';
import { ClientService } from '../../../services/client.service';
import type { Client } from '../../../models';

type PaymentMethod = 'cash' | 'card' | 'mobile_money';

@Component({
  selector: 'app-hospitalization-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hospitalization-form-modal.component.html',
})
export class HospitalizationFormModalComponent implements OnDestroy {
  private hospitalizationService = inject(HospitalizationService);
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  open = input<boolean>(false);
  animalId = input.required<number>();
  presetClientId = input<number | null>(null);

  saved = output<void>();
  cancelled = output<void>();

  selectedClient = signal<Client | null>(null);
  clientSearchResults = signal<Client[]>([]);
  showClientDropdown = signal(false);
  showCreateClient = signal(false);
  isCreatingClient = signal(false);
  createClientError = signal<string | null>(null);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  discountPanelOpen = signal(false);

  form = this.fb.group({
    client_search: [''],
    location: [''],
    reason: [''],
    total_amount: [0 as number, [Validators.required, Validators.min(0)]],
    amount_paid: [0 as number, [Validators.required, Validators.min(0)]],
    payment_method: ['cash' as PaymentMethod, Validators.required],
    discount_type: ['amount' as 'amount' | 'percent' | null],
    discount_value: [0 as number],
  });

  createClientForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    email: ['', [Validators.email]],
  });

  constructor() {
    this.form.get('client_search')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe((q) => {
      if (this.selectedClient()) return;
      if (q && q.length >= 2) {
        this.searchClients(q);
      } else {
        this.clientSearchResults.set([]);
        this.showClientDropdown.set(false);
      }
    });

    effect(() => {
      if (this.open()) {
        this.form.reset({
          client_search: '',
          location: '',
          reason: '',
          total_amount: 0,
          amount_paid: 0,
          payment_method: 'cash',
          discount_type: 'amount',
          discount_value: 0,
        });
        this.discountPanelOpen.set(false);
        this.errorMessage.set(null);
        this.showCreateClient.set(false);

        const preset = this.presetClientId();
        if (preset) {
          this.loadClientById(preset);
        } else {
          this.clearClient(false);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private searchClients(query: string): void {
    this.clientService.getAll(query).subscribe({
      next: (res) => {
        this.clientSearchResults.set(res.data);
        this.showClientDropdown.set(res.data.length > 0);
      },
      error: () => this.clientSearchResults.set([]),
    });
  }

  private loadClientById(id: number): void {
    this.clientService.getOne(id).subscribe({
      next: (res) => this.selectClient(res.data),
      error: () => this.clearClient(false),
    });
  }

  selectClient(client: Client): void {
    this.selectedClient.set(client);
    this.form.get('client_search')!.setValue(client.name, { emitEvent: false });
    this.showClientDropdown.set(false);
    this.showCreateClient.set(false);
  }

  clearClient(resetSearch = true): void {
    this.selectedClient.set(null);
    if (resetSearch) {
      this.form.get('client_search')!.setValue('', { emitEvent: false });
    }
    this.clientSearchResults.set([]);
    this.showClientDropdown.set(false);
    this.showCreateClient.set(false);
  }

  openCreateClient(): void {
    this.createClientForm.reset();
    this.createClientForm.patchValue({ name: this.form.get('client_search')!.value ?? '' });
    this.createClientError.set(null);
    this.showCreateClient.set(true);
    this.showClientDropdown.set(false);
  }

  cancelCreateClient(): void {
    this.showCreateClient.set(false);
    this.createClientForm.reset();
    this.createClientError.set(null);
  }

  saveNewClient(): void {
    if (this.createClientForm.invalid || this.isCreatingClient()) return;
    this.isCreatingClient.set(true);
    this.createClientError.set(null);
    const val = this.createClientForm.value;
    this.clientService.create({
      name: val.name ?? '',
      phone: val.phone || undefined,
      email: val.email || undefined,
    }).subscribe({
      next: (res) => {
        this.selectClient(res.data);
        this.isCreatingClient.set(false);
        this.showCreateClient.set(false);
        this.createClientForm.reset();
      },
      error: (err) => {
        this.createClientError.set(err.error?.message ?? err.error?.errors?.name?.[0] ?? 'Erreur lors de la création.');
        this.isCreatingClient.set(false);
      },
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

    if (Number(raw.amount_paid) === 0 && !this.selectedClient()) {
      this.errorMessage.set('Sélectionnez ou créez un client pour une hospitalisation entièrement à crédit.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.hospitalizationService.create({
      animal_id: this.animalId(),
      client_id: this.selectedClient()?.id ?? null,
      location: raw.location || undefined,
      reason: raw.reason || undefined,
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
      error: (err) => {
        this.isSubmitting.set(false);
        const errors = err.error?.errors;
        this.errorMessage.set(
          errors?.client_id?.[0] ?? errors?.total_amount?.[0] ?? err.error?.message ?? 'Erreur lors de l\'enregistrement.'
        );
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
