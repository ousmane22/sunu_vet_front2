import { Component, inject, signal, OnInit, computed, OnDestroy, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ConsultationService } from '../../../services/consultation.service';
import { ClientService } from '../../../services/client.service';
import { AnimalSpeciesService } from '../../../services/animal-species.service';
import { FormatPricePipe } from '../../../../../core/pipes';
import type { Client, AnimalSpecies, Consultation } from '../../../models';

@Component({
  selector: 'app-consultation-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormatPricePipe],
  templateUrl: './consultation-create-modal.component.html',
})
export class ConsultationCreateModalComponent implements OnInit, OnDestroy {
  private consultationService = inject(ConsultationService);
  private clientService       = inject(ClientService);
  private animalSpeciesService = inject(AnimalSpeciesService);
  private fb       = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  /** Null = création / objet = édition (nom distinct de l’output pour le typage strict du template). */
  editingConsultation = input<Consultation | null>(null);

  close = output<void>();
  /** Consultation créée ou modifiée. */
  saved = output<Consultation>();

  isEditMode = computed(() => !!this.editingConsultation());
  modalTitle = computed(() =>
    this.isEditMode() ? `Modifier consultation #${this.editingConsultation()!.id}` : 'Nouvelle consultation'
  );

  isSubmitting  = signal(false);
  errorMessage  = signal<string | null>(null);
  animalSpecies = signal<AnimalSpecies[]>([]);

  clientSearchResults = signal<Client[]>([]);
  selectedClient      = signal<Client | null>(null);
  showClientDropdown  = signal(false);
  showCreateClient    = signal(false);
  isCreatingClient    = signal(false);
  createClientError   = signal<string | null>(null);

  form = this.fb.group({
    client_search:   [''],
    total_amount:    [0 as number, [Validators.required, Validators.min(0)]],
    amount_paid:     [0 as number, [Validators.required, Validators.min(0)]],
    payment_method:  ['cash' as 'cash' | 'card' | 'mobile_money', Validators.required],
    animal_species:  ['' as string],
    reason_visit:    ['' as string],
    businessal_exam: ['' as string],
    diagnosis:       ['' as string],
    treatment_notes: ['' as string],
  });

  createClientForm = this.fb.group({
    name:  ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    email: ['', [Validators.email]],
  });

  private totalAmountSignal = toSignal(this.form.get('total_amount')!.valueChanges, { initialValue: 0 });
  private amountPaidSignal  = toSignal(this.form.get('amount_paid')!.valueChanges,  { initialValue: 0 });

  netAmount  = computed(() => Number(this.totalAmountSignal() ?? 0));
  amountPaid = computed(() => Number(this.amountPaidSignal() ?? 0));
  amountDue  = computed(() => Math.max(0, this.netAmount() - this.amountPaid()));
  isPartial  = computed(() => this.amountDue() > 0);

  /** Mode édition : avertit si le nouveau montant corrige vers le bas un paiement existant */
  correctionWarning = computed(() => {
    const c = this.editingConsultation();
    if (!c || !this.isEditMode()) return null;
    const newTotal = Number(this.totalAmountSignal() ?? 0);
    if (newTotal < c.net_amount && c.amount_paid > 0) {
      return {
        newTotal,
        alreadyPaid: c.amount_paid,
        diff: c.amount_paid - newTotal,
      };
    }
    return null;
  });

  constructor() {
    // Quand on passe en mode édition, pré-remplir le formulaire
    effect(() => {
      const c = this.editingConsultation();
      if (!c) return;
      this.form.patchValue({
        total_amount:    c.total_amount,
        payment_method:  (c.payment_method as 'cash' | 'card' | 'mobile_money') ?? 'cash',
        animal_species:  c.animal_species  ?? '',
        reason_visit:    c.reason_visit    ?? '',
        businessal_exam: c.businessal_exam ?? '',
        diagnosis:       c.diagnosis       ?? '',
        treatment_notes: c.treatment_notes ?? '',
      });
      if (c.client) {
        this.selectedClient.set(c.client as unknown as Client);
        this.form.get('client_search')!.setValue(c.client.name, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.animalSpeciesService.getAll().subscribe(res => this.animalSpecies.set(res.data));
    this.form.get('client_search')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(q => {
      if (q && q.length >= 2) this.searchClients(q);
      else {
        this.clientSearchResults.set([]);
        this.showClientDropdown.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private searchClients(query: string): void {
    this.clientService.getAll(query).subscribe({
      next:  res => { this.clientSearchResults.set(res.data); this.showClientDropdown.set(res.data.length > 0); },
      error: ()  => this.clientSearchResults.set([]),
    });
  }

  selectClient(client: Client): void {
    this.selectedClient.set(client);
    this.form.get('client_search')!.setValue(client.name, { emitEvent: false });
    this.showClientDropdown.set(false);
    this.showCreateClient.set(false);
  }

  clearClient(): void {
    this.selectedClient.set(null);
    this.form.get('client_search')!.setValue('', { emitEvent: false });
    this.clientSearchResults.set([]);
    this.showCreateClient.set(false);
  }

  setExactAmount(): void {
    this.form.patchValue({ amount_paid: Number(this.form.get('total_amount')?.value ?? 0) });
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
    this.clientService.create({ name: val.name ?? '', phone: val.phone || undefined, email: val.email || undefined }).subscribe({
      next:  res => { this.selectClient(res.data); this.isCreatingClient.set(false); this.showCreateClient.set(false); this.createClientForm.reset(); },
      error: err => { this.createClientError.set(err.error?.message ?? err.error?.errors?.name?.[0] ?? 'Erreur lors de la création.'); this.isCreatingClient.set(false); },
    });
  }

  submit(): void {
    this.errorMessage.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    if (this.isEditMode()) {
      this.submitEdit();
    } else {
      this.submitCreate();
    }
  }

  private submitCreate(): void {
    if (this.amountDue() > 0 && !this.selectedClient()) {
      this.errorMessage.set('Sélectionnez ou créez un client pour enregistrer un crédit partiel ou différé.');
      return;
    }
    const v = this.form.getRawValue();
    this.isSubmitting.set(true);
    this.consultationService.create({
      client_id:       this.selectedClient()?.id ?? undefined,
      total_amount:    Number(v.total_amount),
      amount_paid:     Number(v.amount_paid),
      payment_method:  v.payment_method,
      animal_species:  v.animal_species  || undefined,
      reason_visit:    v.reason_visit    || undefined,
      businessal_exam: v.businessal_exam || undefined,
      diagnosis:       v.diagnosis       || undefined,
      treatment_notes: v.treatment_notes || undefined,
    }).subscribe({
      next:  (res) => { this.isSubmitting.set(false); this.saved.emit(res.data); },
      error: err => { this.isSubmitting.set(false); this.errorMessage.set(err.error?.message ?? 'Erreur lors de l\'enregistrement.'); },
    });
  }

  private submitEdit(): void {
    const c = this.editingConsultation()!;
    const v = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      animal_species:  v.animal_species  || null,
      reason_visit:    v.reason_visit    || null,
      businessal_exam: v.businessal_exam || null,
      diagnosis:       v.diagnosis       || null,
      treatment_notes: v.treatment_notes || null,
    };
    if (Number(v.total_amount) !== c.total_amount)   payload['total_amount']   = Number(v.total_amount);
    if (v.payment_method       !== c.payment_method) payload['payment_method'] = v.payment_method;
    if (this.selectedClient()?.id !== c.client?.id)  payload['client_id']      = this.selectedClient()?.id ?? null;

    this.isSubmitting.set(true);
    this.consultationService.update(c.id, payload).subscribe({
      next:  res => { this.isSubmitting.set(false); this.saved.emit(res.data); },
      error: err => { this.isSubmitting.set(false); this.errorMessage.set(err.error?.message ?? 'Erreur lors de la mise à jour.'); },
    });
  }
}
