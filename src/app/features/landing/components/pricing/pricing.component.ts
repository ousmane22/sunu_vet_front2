import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { LandingActionsService } from '../../services/landing-actions.service';

export interface LandingPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  formatted_price: string;
  currency: string;
  duration_in_months: number;
  max_users: number;
  max_animals: number | null;
  features: string[];
  is_popular: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent implements OnInit {
  private http = inject(HttpClient);
  actions = inject(LandingActionsService);

  /** Plans visibles tout de suite (fallback) — évite une section vide pendant le chargement. */
  plans = signal<LandingPlan[]>(this.getDefaultPlans());
  loading = signal(true);
  loadError = signal(false);

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.http
      .get<unknown>(`${environment.apiUrl}/subscription-plans`)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          const fetched = this.normalizePlans(response);
          this.plans.set(fetched.length ? fetched : this.getDefaultPlans());
        },
        error: () => {
          this.loadError.set(true);
          this.plans.set(this.getDefaultPlans());
        },
      });
  }

  /** Accepte `{ data: [...] }` ou un tableau brut. */
  private normalizePlans(payload: unknown): LandingPlan[] {
    const raw = Array.isArray(payload)
      ? payload
      : (payload as { data?: unknown })?.data;

    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((item) => this.normalizePlan(item))
      .filter((plan): plan is LandingPlan => plan !== null);
  }

  private normalizePlan(raw: unknown): LandingPlan | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const plan = raw as Partial<LandingPlan> & { price?: number | string };
    const price = Number(plan.price ?? 0);
    const currency = plan.currency ?? 'XOF';
    const features = Array.isArray(plan.features) ? plan.features : [];

    if (!plan.name) {
      return null;
    }

    return {
      id: Number(plan.id ?? 0),
      name: plan.name,
      slug: plan.slug ?? '',
      description: plan.description ?? '',
      price,
      formatted_price:
        plan.formatted_price?.trim() ||
        `${new Intl.NumberFormat('fr-FR').format(price)} ${currency}`,
      currency,
      duration_in_months: Number(plan.duration_in_months ?? 1),
      max_users: Number(plan.max_users ?? 0),
      max_animals: plan.max_animals ?? null,
      features,
      is_popular: Boolean(plan.is_popular),
    };
  }

  priceLabel(plan: LandingPlan): string {
    if (plan.slug === 'trial' || plan.price <= 0) {
      return 'Gratuit';
    }
    return plan.formatted_price;
  }

  priceSuffix(plan: LandingPlan): string {
    if (plan.slug === 'trial' || plan.price <= 0) {
      return ' · 30 jours';
    }
    if (plan.slug === 'yearly') {
      return '/an';
    }
    return '/mois';
  }

  getDefaultPlans(): LandingPlan[] {
    return [
      {
        id: 1,
        name: 'Essai Gratuit',
        slug: 'trial',
        description: "Période d'essai de 30 jours",
        price: 0,
        formatted_price: '0 XOF',
        currency: 'XOF',
        duration_in_months: 1,
        max_users: 999,
        max_animals: 999999,
        features: ['Accès complet pendant 30 jours'],
        is_popular: false,
      },
      {
        id: 2,
        name: 'Abonnement Mensuel',
        slug: 'monthly',
        description: 'Abonnement mensuel pour votre clinique vétérinaire',
        price: 20000,
        formatted_price: '20 000 XOF',
        currency: 'XOF',
        duration_in_months: 1,
        max_users: 999,
        max_animals: 999999,
        features: [
          'Toutes les fonctionnalités incluses',
          'Support technique prioritaire',
        ],
        is_popular: true,
      },
      {
        id: 3,
        name: 'Abonnement Annuel',
        slug: 'yearly',
        description: 'Accès complet pendant 1 an (Économisez 40 000 XOF !)',
        price: 200000,
        formatted_price: '200 000 XOF',
        currency: 'XOF',
        duration_in_months: 12,
        max_users: 999,
        max_animals: 999999,
        features: [
          'Toutes les fonctionnalités incluses',
          'Support technique prioritaire',
          'Formation offerte',
        ],
        is_popular: false,
      },
    ];
  }
}
