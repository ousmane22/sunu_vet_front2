import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusinessProfileService } from '../../../services/business-profile.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { PhoneCountryInputComponent } from '../../../../../shared/components/phone-country-input/phone-country-input.component';
import type { BusinessProfile } from '../../../models';

@Component({
    selector: 'app-business-general-settings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PhoneCountryInputComponent],
    template: `
    @if (isLoading()) {
    <div class="flex justify-center py-12">
        <svg class="animate-spin h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
    </div>
    } @else {
    @if (errorMessage()) {
    <div class="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm">
        {{ errorMessage() }}
    </div>
    }
    @if (successMessage()) {
    <div class="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-800 text-sm">
        {{ successMessage() }}
    </div>
    }

    <!-- Logo -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <h2 class="text-base font-bold text-gray-900">Logo de la entreprise</h2>
            <p class="text-xs text-gray-500 mt-0.5">JPEG, PNG, GIF ou WebP — max. 2 Mo</p>
        </div>
        <div class="p-6 flex flex-wrap items-center gap-6">
            <div class="w-24 h-24 rounded-xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                @if (profile()?.logo_url) {
                <img [src]="profile()!.logo_url!" alt="Logo" class="w-full h-full object-contain" />
                } @else {
                <svg class="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
                }
            </div>
            <div class="flex flex-col gap-2">
                <input type="file" #logoInput accept="image/jpeg,image/png,image/gif,image/webp"
                    (change)="onLogoSelected($event)" class="hidden" />
                <button type="button" (click)="logoInput.click()" [disabled]="isUploadingLogo()"
                    class="px-4 py-2.5 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition">
                    @if (isUploadingLogo()) {
                    <span class="flex items-center gap-2">
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Upload en cours...
                    </span>
                    } @else {
                    {{ profile()?.logo_url ? 'Changer le logo' : 'Téléverser un logo' }}
                    }
                </button>
            </div>
        </div>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <h2 class="text-base font-bold text-gray-900">Informations générales</h2>
            </div>
            <div class="p-6 space-y-4">
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nom de la clinique vétérinaire</label>
                    <input id="name" type="text" formControlName="name"
                        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                        placeholder="Ex. Clinique Vétérinaire du Centre" />
                    @if (form.get('name')?.invalid && form.get('name')?.touched) {
                    <p class="mt-1 text-sm text-red-600">Le nom est requis.</p>
                    }
                </div>
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input id="email" type="email" formControlName="email"
                        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                        placeholder="contact&#64;maentreprise.com" />
                    @if (form.get('email')?.invalid && form.get('email')?.touched) {
                    <p class="mt-1 text-sm text-red-600">Un email valide est requis.</p>
                    }
                </div>
                <div>
                    <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <app-phone-country-input formControlName="phone" placeholder="33 123 45 67"
                        [hasError]="!!(form.get('phone')?.invalid && form.get('phone')?.touched)">
                    </app-phone-country-input>
                </div>
                <div>
                    <label for="website" class="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                    <input id="website" type="url" formControlName="website"
                        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                        placeholder="https://www.maentreprise.com" />
                </div>
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea id="description" formControlName="description" rows="3"
                        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition resize-none"
                        placeholder="Courte description de votre clinique vétérinaire"></textarea>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <h2 class="text-base font-bold text-gray-900">Adresse</h2>
            </div>
            <div class="p-6 space-y-4">
                <div>
                    <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input id="address" type="text" formControlName="address"
                        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                        placeholder="Rue, numéro" />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label for="city" class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                        <input id="city" type="text" formControlName="city"
                            class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                            placeholder="Dakar" />
                    </div>
                    <div>
                        <label for="postal_code" class="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                        <input id="postal_code" type="text" formControlName="postal_code"
                            class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                            placeholder="12500" />
                    </div>
                </div>
                <div>
                    <label for="country" class="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                    <input id="country" type="text" formControlName="country"
                        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                        placeholder="Sénégal" />
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
            <button type="submit" [disabled]="form.invalid || isSaving()"
                class="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition flex items-center gap-2">
                @if (isSaving()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>Enregistrement...</span>
                } @else {
                <span>Enregistrer les modifications</span>
                }
            </button>
        </div>
    </form>
    }
  `
})
export class GeneralSettingsComponent implements OnInit {
    private fb = inject(FormBuilder);
    private profileService = inject(BusinessProfileService);
    private authService = inject(AuthService);

    profile = signal<BusinessProfile | null>(null);
    isLoading = signal(true);
    isSaving = signal(false);
    isUploadingLogo = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    private readonly maxLogoSizeBytes = 2 * 1024 * 1024; // 2 Mo
    private readonly acceptedLogoTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    form = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(255)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
        phone: ['', [Validators.maxLength(35)]],
        address: ['', [Validators.maxLength(500)]],
        city: ['', [Validators.maxLength(100)]],
        postal_code: ['', [Validators.maxLength(20)]],
        country: ['', [Validators.maxLength(100)]],
        description: ['', [Validators.maxLength(2000)]],
        website: ['', [Validators.maxLength(255)]],
    });

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.isLoading.set(true);
        this.errorMessage.set(null);
        this.profileService.getProfile().subscribe({
            next: (res) => {
                this.profile.set(res.data);
                this.form.patchValue({
                    name: res.data.name,
                    email: res.data.email,
                    phone: res.data.phone ?? '',
                    address: res.data.address ?? '',
                    city: res.data.city ?? '',
                    postal_code: res.data.postal_code ?? '',
                    country: res.data.country ?? '',
                    description: res.data.description ?? '',
                    website: res.data.website ?? '',
                });
                this.isLoading.set(false);
            },
            error: (err) => {
                this.errorMessage.set(err.error?.message ?? 'Impossible de charger la entreprise.');
                this.isLoading.set(false);
            },
        });
    }

    onSubmit(): void {
        if (this.form.invalid || this.isSaving()) return;

        this.isSaving.set(true);
        this.successMessage.set(null);
        this.errorMessage.set(null);

        const value = this.form.getRawValue();
        const payload = {
            name: value.name ?? undefined,
            email: value.email ?? undefined,
            phone: value.phone || undefined,
            address: value.address || undefined,
            city: value.city || undefined,
            postal_code: value.postal_code || undefined,
            country: value.country || undefined,
            description: value.description || undefined,
            website: value.website || undefined,
        };

        this.profileService.updateProfile(payload).subscribe({
            next: (res) => {
                this.profile.set(res.data);
                this.successMessage.set(res.message ?? 'Modifications enregistrées.');
                this.isSaving.set(false);
                // Met à jour currentUser + localStorage (ex. business_name dans le layout)
                this.authService.refreshProfile().subscribe({ error: () => {} });
            },
            error: (err) => {
                this.errorMessage.set(
                    err.error?.message ?? err.error?.errors
                        ? Object.values(err.error.errors).flat().join(' ')
                        : 'Erreur.'
                );
                this.isSaving.set(false);
            },
        });
    }

    onLogoSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        if (!this.acceptedLogoTypes.includes(file.type)) {
            this.errorMessage.set('Format accepté : JPEG, PNG, GIF ou WebP.');
            input.value = '';
            return;
        }
        if (file.size > this.maxLogoSizeBytes) {
            this.errorMessage.set("L'image ne doit pas dépasser 2 Mo.");
            input.value = '';
            return;
        }

        this.errorMessage.set(null);
        this.successMessage.set(null);
        this.isUploadingLogo.set(true);

        this.profileService.uploadLogo(file).subscribe({
            next: (res) => {
                this.profile.set(res.data);
                this.successMessage.set(res.message ?? 'Logo mis à jour.');
                this.isUploadingLogo.set(false);
                input.value = '';
                this.authService.refreshProfile().subscribe({ error: () => {} });
            },
            error: (err) => {
                this.errorMessage.set(
                    err.error?.message ?? err.error?.errors?.logo?.[0] ?? 'Erreur.'
                );
                this.isUploadingLogo.set(false);
                input.value = '';
            },
        });
    }
}




