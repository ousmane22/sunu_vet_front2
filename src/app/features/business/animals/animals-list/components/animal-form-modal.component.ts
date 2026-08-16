import { Component, inject, signal, input, output, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AnimalService } from '../../../services/animal.service';
import { AnimalSpeciesService } from '../../../services/animal-species.service';
import { BreedService } from '../../../services/breed.service';
import { ClientService } from '../../../services/client.service';
import type { Animal, AnimalSpecies, Breed, Client, AnimalDetail } from '../../../models';
import { formatAgeFromBirthDate } from '../../../../../core/utils/format.util';

@Component({
  selector: 'app-animal-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './animal-form-modal.component.html',
})
export class AnimalFormModalComponent implements OnDestroy {
  private animalService = inject(AnimalService);
  private speciesService = inject(AnimalSpeciesService);
  private breedService = inject(BreedService);
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  open = input<boolean>(false);
  animal = input<Animal | null>(null);
  /** Pré-remplit le propriétaire à la création. */
  presetClientId = input<number | null>(null);

  saved = output<Animal>();
  cancelled = output<void>();

  species = signal<AnimalSpecies[]>([]);
  breeds = signal<Breed[]>([]);
  selectedClient = signal<Client | null>(null);
  clientSearchResults = signal<Client[]>([]);
  showClientDropdown = signal(false);
  showCreateClient = signal(false);
  isCreatingClient = signal(false);
  createClientError = signal<string | null>(null);

  isSubmitting = signal(false);
  referenceLoading = signal(false);
  breedsLoading = signal(false);
  errorMessage = signal<string | null>(null);
  currentStep = signal(1);

  readonly steps = [
    {
      num: 1,
      label: 'Identité & propriétaire',
      shortLabel: 'Identité',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      num: 2,
      label: 'Médical & suivi',
      shortLabel: 'Médical',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
  ] as const;

  isUploadingPhoto = signal(false);
  photoError = signal<string | null>(null);
  uploadedPhotoUrl = signal<string | null>(null);
  private readonly maxPhotoSizeBytes = 2 * 1024 * 1024;
  private readonly acceptedPhotoTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  form = this.fb.group({
    client_search: [''],
    client_id: [null as number | null],
    animal_species_id: [null as number | null, Validators.required],
    breed_id: [null as number | null],
    name: [''],
    gender: ['unknown' as Animal['gender']],
    date_of_birth: [''],
    age_notes: [''],
    weight_kg: [null as number | null],
    microchip: [''],
    tattoo: [''],
    medical_history: [''],
    allergies: [''],
    notes: [''],
  });

  createClientForm = this.fb.group({
    name:  ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    email: ['', [Validators.email]],
  });

  constructor() {
    this.form.get('animal_species_id')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((speciesId) => {
        this.form.patchValue({ breed_id: null }, { emitEvent: false });
        if (speciesId) {
          this.loadBreeds(speciesId);
        } else {
          this.breeds.set([]);
        }
      });

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

    this.form.get('date_of_birth')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((dob) => this.syncAgeFromBirthDate(dob));

    effect(() => {
      if (this.open()) {
        this.currentStep.set(1);
        this.loadReferenceData();
      }
    });

    effect(() => {
      const a = this.animal();
      const preset = this.presetClientId();
      this.showCreateClient.set(false);
      this.createClientError.set(null);
      this.uploadedPhotoUrl.set(null);
      this.photoError.set(null);

      if (a) {
        this.form.patchValue({
          animal_species_id: a.animal_species_id,
          breed_id: a.breed_id ?? null,
          name: a.name ?? '',
          gender: a.gender,
          date_of_birth: a.date_of_birth ?? '',
          age_notes: this.resolveAgeNotes(a.date_of_birth, a.age_notes),
          weight_kg: a.weight_kg ?? null,
          microchip: a.microchip ?? '',
          tattoo: a.tattoo ?? '',
          medical_history: (a as AnimalDetail).medical_history ?? '',
          allergies: (a as AnimalDetail).allergies ?? '',
          notes: (a as AnimalDetail).notes ?? '',
        });
        if (a.animal_species_id) {
          this.loadBreeds(a.animal_species_id);
        }
        if (a.client_id) {
          this.applyOwnerFromAnimal(a);
        } else {
          this.clearClient(false);
        }
      } else {
        this.form.patchValue({
          animal_species_id: null,
          breed_id: null,
          name: '',
          gender: 'unknown',
          date_of_birth: '',
          age_notes: '',
          weight_kg: null,
          microchip: '',
          tattoo: '',
          medical_history: '',
          allergies: '',
          notes: '',
        });
        this.breeds.set([]);
        if (preset) {
          this.loadClientById(preset);
        } else {
          this.clearClient(false);
        }
      }
      this.errorMessage.set(null);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isEditMode(): boolean {
    return !!this.animal();
  }

  isStepDisabled(stepNum: number): boolean {
    if (stepNum === 1) return false;
    if (this.isEditMode) return false;
    return !this.isStep1Valid();
  }

  isStep1Valid(): boolean {
    return !!this.form.get('animal_species_id')?.value;
  }

  goToStep(step: number): void {
    if (this.isStepDisabled(step)) return;
    this.currentStep.set(step);
  }

  nextStep(): void {
    if (!this.isStep1Valid()) {
      this.form.get('animal_species_id')?.markAsTouched();
      return;
    }
    this.currentStep.set(2);
  }

  prevStep(): void {
    this.currentStep.set(1);
  }

  /** Date max pour la naissance (aujourd'hui). */
  todayIso = new Date().toISOString().slice(0, 10);

  get ageIsAutoCalculated(): boolean {
    return !!this.form.get('date_of_birth')?.value;
  }

  private resolveAgeNotes(dateOfBirth?: string | null, fallback?: string | null): string {
    return formatAgeFromBirthDate(dateOfBirth) ?? fallback ?? '';
  }

  private syncAgeFromBirthDate(dateOfBirth: string | null | undefined): void {
    const age = formatAgeFromBirthDate(dateOfBirth);
    this.form.patchValue({ age_notes: age ?? '' }, { emitEvent: false });
  }

  private loadReferenceData(): void {
    this.referenceLoading.set(true);
    this.speciesService.getAll().subscribe({
      next: (res) => {
        this.species.set(res.data ?? []);
        this.referenceLoading.set(false);
      },
      error: () => {
        this.referenceLoading.set(false);
        this.errorMessage.set('Impossible de charger les espèces.');
      },
    });
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

  private applyOwnerFromAnimal(a: Animal): void {
    const detail = a as AnimalDetail;
    if (detail.client) {
      this.selectClient(detail.client as Client);
      return;
    }
    if (a.client_name) {
      this.selectClient({
        id: a.client_id!,
        name: a.client_name,
        balance_due: 0,
      } as Client);
      return;
    }
    this.loadClientById(a.client_id!);
  }

  selectClient(client: Client): void {
    this.selectedClient.set(client);
    this.form.patchValue({
      client_id: client.id,
      client_search: client.name,
    }, { emitEvent: false });
    this.showClientDropdown.set(false);
    this.showCreateClient.set(false);
  }

  clearClient(resetSearch = true): void {
    this.selectedClient.set(null);
    this.form.patchValue({ client_id: null }, { emitEvent: false });
    if (resetSearch) {
      this.form.get('client_search')!.setValue('', { emitEvent: false });
    }
    this.clientSearchResults.set([]);
    this.showClientDropdown.set(false);
    this.showCreateClient.set(false);
  }

  openCreateClient(): void {
    this.createClientForm.reset();
    this.createClientForm.patchValue({
      name: this.form.get('client_search')!.value ?? '',
    });
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
        this.createClientError.set(
          err.error?.message ?? err.error?.errors?.name?.[0] ?? 'Erreur lors de la création.',
        );
        this.isCreatingClient.set(false);
      },
    });
  }

  private loadBreeds(speciesId: number): void {
    this.breedsLoading.set(true);
    this.breedService.getBySpecies(speciesId).subscribe({
      next: (res) => {
        this.breeds.set(res.data ?? []);
        this.breedsLoading.set(false);
      },
      error: () => {
        this.breeds.set([]);
        this.breedsLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const raw = this.form.getRawValue();
    const ageNotes = raw.date_of_birth
      ? (formatAgeFromBirthDate(raw.date_of_birth) ?? (raw.age_notes || undefined))
      : (raw.age_notes || undefined);
    const trimmedName = raw.name?.trim();
    const payload: Partial<Animal> & Record<string, unknown> = {
      client_id: this.selectedClient()?.id ?? raw.client_id ?? undefined,
      animal_species_id: raw.animal_species_id ?? undefined,
      breed_id: raw.breed_id || undefined,
      gender: raw.gender ?? 'unknown',
      date_of_birth: raw.date_of_birth || undefined,
      age_notes: ageNotes,
      weight_kg: raw.weight_kg ?? undefined,
      microchip: raw.microchip || undefined,
      tattoo: raw.tattoo || undefined,
      medical_history: raw.medical_history || undefined,
      allergies: raw.allergies || undefined,
      notes: raw.notes || undefined,
    };

    if (trimmedName) {
      payload.name = trimmedName;
    } else if (this.isEditMode) {
      payload.name = null;
    }

    const a = this.animal();
    const req = a
      ? this.animalService.update(a.id, payload)
      : this.animalService.create(payload);

    req.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.saved.emit(res.data);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errors = err.error?.errors;
        this.errorMessage.set(
          errors?.name?.[0]
            ?? errors?.animal_species_id?.[0]
            ?? err.error?.message
            ?? 'Erreur lors de l\'enregistrement.',
        );
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const animalId = this.animal()?.id;
    if (!file || !animalId) return;

    if (!this.acceptedPhotoTypes.includes(file.type)) {
      this.photoError.set('Format accepté : JPEG, PNG, GIF ou WebP.');
      input.value = '';
      return;
    }
    if (file.size > this.maxPhotoSizeBytes) {
      this.photoError.set("L'image ne doit pas dépasser 2 Mo.");
      input.value = '';
      return;
    }

    this.photoError.set(null);
    this.isUploadingPhoto.set(true);

    this.animalService.uploadPhoto(animalId, file).subscribe({
      next: (res) => {
        this.uploadedPhotoUrl.set(res.data.photo_url ?? null);
        this.isUploadingPhoto.set(false);
        input.value = '';
      },
      error: (err) => {
        this.photoError.set(err.error?.message ?? err.error?.errors?.photo?.[0] ?? 'Erreur lors de l\'envoi.');
        this.isUploadingPhoto.set(false);
        input.value = '';
      },
    });
  }
}
