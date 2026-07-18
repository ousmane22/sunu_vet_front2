import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AlertComponent } from '../../../../shared/components/alert/alert/alert.component';
import { PhoneCountryInputComponent } from '../../../../shared/components/phone-country-input/phone-country-input.component';

const RESEND_DELAY_SECONDS = 30;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AlertComponent, PhoneCountryInputComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  currentStep = signal(1);
  email = signal('');
  name = signal('');
  businessName = signal('');
  businessAddress = signal('');
  businessPhone = signal('');
  code = signal('');
  resendCountdown = signal(0);
  isResending = signal(false);
  /** True après le premier envoi du code (même si l'utilisateur revient à l'étape 1). */
  codeSent = signal(false);
  private resendIntervalId: ReturnType<typeof setInterval> | null = null;

  step1Form: FormGroup = this.fb.group({
    business_name: ['', [Validators.required, Validators.maxLength(255)]],
    business_address: ['', [Validators.required, Validators.maxLength(500)]],
    business_phone: ['', [Validators.required, Validators.maxLength(35)]],
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
  });

  step2Form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  passwordVisible = signal(false);

  steps = [
    { num: 1, label: 'Clinique & vous', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { num: 2, label: 'Code & mot de passe', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  ];

  private passwordMatchValidator(g: FormGroup): { [key: string]: boolean } | null {
    const p = g.get('password')?.value;
    const c = g.get('password_confirmation')?.value;
    return p && c && p !== c ? { passwordMismatch: true } : null;
  }

  onStep1Submit(event: Event): void {
    event.preventDefault();
    if (this.codeSent()) {
      this.goToStep(2);
    } else {
      this.sendCode();
    }
  }

  sendCode(): void {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }
    const v = this.step1Form.value;
    this.email.set(v.email);
    this.name.set(v.name);
    this.businessName.set(v.business_name);
    this.businessAddress.set(v.business_address);
    this.businessPhone.set(v.business_phone);
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.auth.sendVerificationCode(v.email).subscribe({
      next: () => {
        this.codeSent.set(true);
        this.successMessage.set('Un code à 6 chiffres a été envoyé à votre adresse email.');
        this.currentStep.set(2);
        this.startResendCountdown();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.setError(err);
        this.isLoading.set(false);
      },
    });
  }

  submitRegister(): void {
    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload = {
      email: this.email(),
      code: this.step2Form.value.code,
      name: this.name(),
      business_name: this.businessName(),
      business_address: this.businessAddress(),
      business_phone: this.businessPhone(),
      password: this.step2Form.value.password,
      password_confirmation: this.step2Form.value.password_confirmation,
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/business', 'dashboard']);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.setError(err);
        this.isLoading.set(false);
      },
    });
  }

  private setError(err: { status?: number; error?: { message?: string; errors?: Record<string, string[]> } }): void {
    if (err.status === 422 && err.error?.errors) {
      const first = Object.values(err.error.errors).flat()[0];
      this.errorMessage.set(first || 'Erreur de validation.');
    } else {
      this.errorMessage.set(err.error?.message || 'Une erreur est survenue. Veuillez réessayer.');
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update((v) => !v);
  }

  isStepDisabled(stepNum: number): boolean {
    if (stepNum === 1) return false;
    if (stepNum === 2) return this.currentStep() < 2 && !this.codeSent();
    return this.currentStep() < stepNum;
  }

  goToStep(step: number): void {
    if (this.isStepDisabled(step)) return;
    if (step < this.currentStep()) {
      this.currentStep.set(step);
      this.errorMessage.set(null);
      this.stopResendCountdown();
    } else if (step === 2 && this.currentStep() === 1 && this.codeSent()) {
      this.currentStep.set(2);
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

  resendCode(): void {
    if (this.resendCountdown() > 0 || this.isResending()) return;
    this.isResending.set(true);
    this.errorMessage.set(null);
    this.auth.sendVerificationCode(this.email()).subscribe({
      next: () => {
        this.successMessage.set('Un nouveau code a été envoyé à votre adresse email.');
        this.startResendCountdown();
        this.isResending.set(false);
      },
      error: (err) => {
        this.setError(err);
        this.isResending.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.stopResendCountdown();
  }
}
