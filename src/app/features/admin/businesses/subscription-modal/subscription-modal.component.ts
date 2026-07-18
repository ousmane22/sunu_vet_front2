import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BusinessService } from '../../services/business.service';
import { Subscription, SubscriptionPlan, SubscriptionStatusDb } from '../../models/business.model';

type SubscriptionWritePayload = {
  subscription_plan_id: number | null;
  starts_at: string;
  ends_at: string;
  auto_renew: boolean;
  status?: SubscriptionStatusDb;
};

/** Libellés super-admin — valeurs = API Laravel. */
export const SUBSCRIPTION_STATUS_OPTIONS: { value: SubscriptionStatusDb; label: string }[] = [
  { value: 'active', label: 'Actif' },
  { value: 'trial', label: 'Essai (statut technique)' },
  { value: 'past_due', label: 'Impayé / en retard' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'expired', label: 'Expiré' },
];

@Component({
  selector: 'app-subscription-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subscription-modal.component.html',
})
export class SubscriptionModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);

  businessId = input.required<number>();
  subscription = input<Subscription | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  plans = signal<SubscriptionPlan[]>([]);
  isLoading = signal(true);
  isSubmitting = false;
  serverError: string | null = null;
  selectedPlan = signal<SubscriptionPlan | null>(null);

  readonly statusOptions = SUBSCRIPTION_STATUS_OPTIONS;

  get isEditMode() {
    return !!this.subscription();
  }

  form = this.fb.group({
    subscription_plan_id: [null as number | null, [Validators.required]],
    starts_at: [new Date().toISOString().substring(0, 10), [Validators.required]],
    ends_at: ['', [Validators.required]],
    auto_renew: [true],
    status: ['active' as SubscriptionStatusDb],
  });

  ngOnInit() {
    this.businessService.getSubscriptionPlans().subscribe({
      next: (res) => {
        this.plans.set(res.data as SubscriptionPlan[]);
        this.isLoading.set(false);
        const sub = this.subscription();
        if (sub) {
          this.form.patchValue({
            subscription_plan_id: sub.subscription_plan_id,
            starts_at: sub.starts_at?.substring(0, 10) ?? '',
            ends_at: sub.ends_at?.substring(0, 10) ?? '',
            auto_renew: sub.auto_renew ?? true,
            status: this.normalizeSubscriptionStatus(sub.status),
          });
          const plan = this.plans().find((p) => p.id === sub.subscription_plan_id);
          this.selectedPlan.set(plan ?? null);
        }
      },
      error: () => this.isLoading.set(false),
    });

    this.form.get('subscription_plan_id')!.valueChanges.subscribe((id) => {
      const plan = this.plans().find((p) => p.id === +id!);
      this.selectedPlan.set(plan ?? null);
      if (!this.isEditMode) {
        this.computeEndDate();
      }
    });
    this.form.get('starts_at')!.valueChanges.subscribe(() => {
      if (!this.isEditMode) {
        this.computeEndDate();
      }
    });
  }

  /** Ancienne UI envoyait « suspended » — n’existe pas en base sur subscriptions. */
  private normalizeSubscriptionStatus(s: string): SubscriptionStatusDb {
    const allowed: SubscriptionStatusDb[] = ['trial', 'active', 'past_due', 'cancelled', 'expired'];
    if (allowed.includes(s as SubscriptionStatusDb)) {
      return s as SubscriptionStatusDb;
    }
    if (s === 'suspended') {
      return 'expired';
    }
    return 'active';
  }

  /** +N jours sur une date YYYY-MM-DD sans décalage fuseau (aligné PHP addDays). */
  private addDaysToYmd(ymd: string, days: number): string {
    const [y, m, d] = ymd.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  }

  private computeEndDate() {
    const plan = this.selectedPlan();
    const start = this.form.get('starts_at')!.value;
    if (!plan || !start) {
      return;
    }
    this.form.get('ends_at')!.setValue(this.addDaysToYmd(start, plan.duration_days));
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.serverError = null;

    const raw = this.form.getRawValue();
    const payload: SubscriptionWritePayload = {
      subscription_plan_id: raw.subscription_plan_id ?? null,
      starts_at: raw.starts_at ?? '',
      ends_at: raw.ends_at ?? '',
      auto_renew: !!raw.auto_renew,
    };
    if (this.isEditMode) {
      payload.status = raw.status as SubscriptionStatusDb;
    }

    const request$ = this.isEditMode
      ? this.businessService.updateSubscription(this.businessId(), this.subscription()!.id, payload)
      : this.businessService.addSubscription(this.businessId(), payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.saved.emit();
      },
      error: (err: { error?: { errors?: Record<string, string[]>; message?: string } }) => {
        this.isSubmitting = false;
        const errors = err.error?.errors;
        if (errors) {
          this.serverError = Object.values(errors)
            .flat()
            .join(' ');
        } else {
          this.serverError = err.error?.message ?? 'Erreur inattendue.';
        }
      },
    });
  }

  cancel() {
    this.cancelled.emit();
  }
}
