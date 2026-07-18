import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BusinessProfileService } from '../../../services/business-profile.service';
import type { BusinessProfile } from '../../../models';

@Component({
    selector: 'app-business-billing-settings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
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

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Paramètres de facturation -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
                <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 class="text-base font-bold text-gray-900">Paramètres de Facturation</h2>
            </div>
            <div class="p-6 space-y-4">
                <div class="flex items-start justify-between">
                    <div class="flex-1 pr-8">
                        <label for="require_open_register" class="text-sm font-bold text-gray-900 cursor-pointer">
                            Exiger l'ouverture d'une caisse
                        </label>
                        <p class="mt-1 text-sm text-gray-500">
                            Si désactivé, les vétérinaires pourront vendre et encaisser des consultations de manière
                            flexible sans qu'une caisse physique ne soit préalablement ouverte. Les paiements seront
                            enregistrés globalement.
                        </p>
                    </div>
                    <div class="flex items-center h-5 mt-1">
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input id="require_open_register" type="checkbox" formControlName="require_open_register"
                                class="sr-only peer" />
                            <div
                                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600">
                            </div>
                        </label>
                    </div>
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
export class BillingSettingsComponent implements OnInit {
    private fb = inject(FormBuilder);
    private profileService = inject(BusinessProfileService);

    profile = signal<BusinessProfile | null>(null);
    isLoading = signal(true);
    isSaving = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    form = this.fb.group({
        require_open_register: [false],
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
                    require_open_register: res.data.settings?.require_open_register ?? false,
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
            settings: {
                ...(this.profile()?.settings || {}),
                require_open_register: value.require_open_register ?? false,
            },
        };

        this.profileService.updateProfile(payload).subscribe({
            next: (res) => {
                this.profile.set(res.data);
                this.successMessage.set(res.message ?? 'Modifications enregistrées.');
                this.isSaving.set(false);
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
}




