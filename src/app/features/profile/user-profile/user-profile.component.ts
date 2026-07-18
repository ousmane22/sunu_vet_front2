import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileService, type UserProfile, type UserProfileResponse } from '../../../core/services/user-profile.service';
import { AuthService, type User } from '../../auth/services/auth.service';

type TabId = 'info' | 'password';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(UserProfileService);
  private authService = inject(AuthService);

  profile = signal<UserProfile | null>(null);
  activeTab = signal<TabId>('info');
  isLoading = signal(true);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  /** Retour contextualisé (hors layout business / admin). */
  homeLink = computed(() => {
    const u = this.authService.currentUser();
    if (!u) {
      return '/';
    }
    if (u.business_id != null && u.business_id !== 0) {
      return '/business/dashboard';
    }
    const roles = u.roles ?? [];
    if (roles.some((r) => r === 'super-admin' || r === 'super_admin')) {
      return '/super-admin';
    }
    return '/';
  });

  infoForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
  });

  passwordForm = this.fb.group({
    current_password: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.profile.set(res.data);
        this.infoForm.patchValue({ name: res.data.name, email: res.data.email });
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger le profil.');
        this.isLoading.set(false);
      },
    });
  }

  setTab(tab: TabId): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  onSubmitInfo(): void {
    if (this.infoForm.invalid || this.isSaving()) return;
    const val = this.infoForm.getRawValue();
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.profileService.updateProfile({ name: val.name!, email: val.email! }).subscribe({
      next: (res: UserProfileResponse) => {
        this.profile.set(res.data);
        this.authService.updateCurrentUser(res.data as User);
        this.successMessage.set(res.message ?? 'Profil mis à jour.');
        this.isSaving.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message ?? (err.error?.errors ? Object.values(err.error.errors).flat().join(' ') : 'Erreur.')
        );
        this.isSaving.set(false);
      },
    });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid || this.isSaving()) return;
    const val = this.passwordForm.getRawValue();
    if (val.password !== val.password_confirmation) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.profileService
      .updatePassword({
        current_password: val.current_password!,
        password: val.password!,
        password_confirmation: val.password_confirmation!,
      })
      .subscribe({
        next: (res) => {
          this.successMessage.set(res.message ?? 'Mot de passe modifié.');
          this.passwordForm.reset({ current_password: '', password: '', password_confirmation: '' });
          this.isSaving.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message ?? (err.error?.errors ? Object.values(err.error.errors).flat().join(' ') : 'Erreur.')
          );
          this.isSaving.set(false);
        },
      });
  }
}



