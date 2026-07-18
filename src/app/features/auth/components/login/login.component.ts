import { Component, inject, signal, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

import { AlertComponent } from '../../../../shared/components/alert/alert/alert.component';

const RESEND_DELAY_SECONDS = 30;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, AlertComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  redirectMessage = signal<string | null>(null);
  showForgotModal = signal(false);
  forgotStep = signal(1);
  forgotEmail = signal('');
  resendCountdown = signal(0);
  isResending = signal(false);
  private resendIntervalId: ReturnType<typeof setInterval> | null = null;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  forgotEmailForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  forgotResetForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  /** Message affiché sur la page login après une réinitialisation réussie */
  resetSuccessMessage = signal<string | null>(null);
  forgotError = signal<string | null>(null);
  forgotSuccess = signal<string | null>(null);
  passwordVisible = signal(false);
  resetPasswordVisible = signal(false);

  private passwordMatchValidator(g: FormGroup): { [key: string]: boolean } | null {
    const p = g.get('password')?.value;
    const c = g.get('password_confirmation')?.value;
    return p && c && p !== c ? { passwordMismatch: true } : null;
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update((v) => !v);
  }

  toggleResetPasswordVisibility(): void {
    this.resetPasswordVisible.update((v) => !v);
  }

  openForgotModal(): void {
    this.showForgotModal.set(true);
    this.forgotStep.set(1);
    this.forgotEmailForm.reset();
    this.forgotResetForm.reset();
    this.forgotError.set(null);
    this.forgotSuccess.set(null);
    this.resetSuccessMessage.set(null);
    this.forgotEmail.set('');
    this.stopResendCountdown();
  }

  closeForgotModal(): void {
    this.showForgotModal.set(false);
    this.forgotStep.set(1);
    this.forgotError.set(null);
    this.forgotSuccess.set(null);
    this.stopResendCountdown();
  }

  sendResetCode(): void {
    if (this.forgotEmailForm.invalid) {
      this.forgotEmailForm.markAllAsTouched();
      return;
    }
    const email = this.forgotEmailForm.value.email;
    this.isLoading.set(true);
    this.forgotError.set(null);
    this.forgotSuccess.set(null);
    this.authService.sendResetCode(email).subscribe({
      next: () => {
        this.forgotEmail.set(email);
        this.forgotSuccess.set('Un code à 6 chiffres a été envoyé à votre adresse email.');
        this.forgotStep.set(2);
        this.startResendCountdown();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.setForgotError(err);
        this.isLoading.set(false);
      },
    });
  }

  submitResetPassword(): void {
    if (this.forgotResetForm.invalid) {
      this.forgotResetForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.forgotError.set(null);
    const payload = {
      email: this.forgotEmail(),
      code: this.forgotResetForm.value.code,
      password: this.forgotResetForm.value.password,
      password_confirmation: this.forgotResetForm.value.password_confirmation,
    };
    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.closeForgotModal();
        this.resetSuccessMessage.set('Mot de passe réinitialisé. Vous pouvez vous connecter avec votre nouveau mot de passe.');
      },
      error: (err) => {
        this.setForgotError(err);
        this.isLoading.set(false);
      },
    });
  }

  private setForgotError(err: { status?: number; error?: { message?: string; errors?: Record<string, string[]> } }): void {
    if (err.status === 422 && err.error?.errors) {
      const first = Object.values(err.error.errors).flat()[0];
      this.forgotError.set(first || 'Erreur de validation.');
    } else {
      this.forgotError.set(err.error?.message || 'Une erreur est survenue. Veuillez réessayer.');
    }
  }

  startResendCountdown(): void {
    this.stopResendCountdown();
    this.resendCountdown.set(RESEND_DELAY_SECONDS);
    this.resendIntervalId = setInterval(() => {
      const left = this.resendCountdown() - 1;
      this.resendCountdown.set(left);
      if (left <= 0) this.stopResendCountdown();
    }, 1000);
  }

  private stopResendCountdown(): void {
    if (this.resendIntervalId !== null) {
      clearInterval(this.resendIntervalId);
      this.resendIntervalId = null;
    }
    this.resendCountdown.set(0);
  }

  backToForgotStep1(): void {
    this.forgotStep.set(1);
    this.forgotError.set(null);
  }

  resendResetCode(): void {
    if (this.resendCountdown() > 0 || this.isResending()) return;
    this.isResending.set(true);
    this.forgotError.set(null);
    this.authService.sendResetCode(this.forgotEmail()).subscribe({
      next: () => {
        this.forgotSuccess.set('Un nouveau code a été envoyé à votre adresse email.');
        this.startResendCountdown();
        this.isResending.set(false);
      },
      error: (err) => {
        this.setForgotError(err);
        this.isResending.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.stopResendCountdown();
  }

  constructor() {
    this.route.queryParams.subscribe((params) => {
      if (params['subscriptionExpired'] === '1') {
        this.redirectMessage.set('Votre période d\'essai ou votre abonnement est terminé. Renouvelez votre abonnement pour accéder à l\'espace entreprise.');
      } else if (params['businessDisabled'] === '1') {
        this.redirectMessage.set('Votre entreprise a été désactivée. L\'accès à l\'espace entreprise est refusé. Contactez l\'administrateur.');
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        // Super-admin → espace super-admin ; utilisateur avec entreprise → dashboard entreprise
        if (this.hasSuperAdminRole(response.user.roles)) {
          this.router.navigate(['/super-admin']);
        } else if (response.user.business_id) {
          this.router.navigate(['/business', 'dashboard']);
        } else {
          this.router.navigate(['/']);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Login error', err);
        // Map backend validation errors (422) if available
        if (err.status === 422 && err.error?.errors) {
          const errors = err.error.errors;
          if (errors.email) {
            this.errorMessage.set(errors.email[0]);
          } else if (errors.password) {
            this.errorMessage.set(errors.password[0]);
          } else {
            this.errorMessage.set("Erreur de validation");
          }
        } else {
          this.errorMessage.set("Une erreur s'est produite lors de la connexion. Veuillez réessayer.");
        }
        this.isLoading.set(false);
      }
    });
  }

  private hasSuperAdminRole(roles: unknown): boolean {
    if (!Array.isArray(roles)) return false;
    return roles.some((r) => r === 'super-admin' || r === 'super_admin');
  }
}



