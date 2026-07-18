import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { BusinessProfileService } from '../../../services/business-profile.service';
import type { BusinessProfile, ActiveSubscriptionProfile, SubscriptionPlanProfile } from '../../../models/business.model';

@Component({
    selector: 'app-business-subscription-settings',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './subscription-settings.component.html',
})
export class SubscriptionSettingsComponent implements OnInit {
    private profileService = inject(BusinessProfileService);
    private http = inject(HttpClient);

    profile = signal<BusinessProfile | null>(null);
    plans = signal<SubscriptionPlanProfile[]>([]);
    isLoading = signal(true);
    errorMessage = signal<string | null>(null);
    isSubscribing = signal(false);

    /** Plan mensuel (hors essai) pour proposer le passage essai → mensuel. */
    monthlyPlan = computed(() => this.plans().find((p) => p.slug === 'monthly'));

    /** Afficher le bouton "Activer l'abonnement mensuel" : en essai (plan trial ou is_on_trial) et plan mensuel dispo. */
    canSwitchToMonthly = computed(() => {
        const onTrialPlan = this.subscription()?.plan?.slug === 'trial';
        return (onTrialPlan || this.isTrial()) && !!this.monthlyPlan();
    });

    ngOnInit(): void {
        this.profileService.getProfile().subscribe({
            next: (res) => {
                this.profile.set(res.data);
                this.isLoading.set(false);
            },
            error: () => {
                this.errorMessage.set('Impossible de charger le profil.');
                this.isLoading.set(false);
            },
        });
        this.http.get<{ data: SubscriptionPlanProfile[] }>(`${environment.apiUrl}/subscription-plans`).subscribe({
            next: (res) => this.plans.set(res.data ?? []),
            error: () => this.plans.set([]),
        });
    }

    loadProfile(): void {
        this.profileService.getProfile().subscribe({
            next: (res) => this.profile.set(res.data),
            error: () => this.errorMessage.set('Impossible de recharger le profil.'),
        });
    }

    /** Passe de l'essai à l'abonnement mensuel. */
    activateMonthly(): void {
        const plan = this.monthlyPlan();
        if (!plan || this.isSubscribing()) return;
        this.errorMessage.set(null);
        this.isSubscribing.set(true);
        this.profileService.subscribeToPlan(plan.id).subscribe({
            next: () => {
                this.isSubscribing.set(false);
                this.loadProfile();
            },
            error: (err) => {
                this.isSubscribing.set(false);
                this.errorMessage.set(err.error?.message ?? 'Erreur lors de l\'activation de l\'abonnement.');
            },
        });
    }

    subscription(): ActiveSubscriptionProfile | null | undefined {
        return this.profile()?.active_subscription ?? null;
    }

    /** Jours restants : abonnement actif ou période d'essai. */
    daysRemaining(): number {
        const p = this.profile();
        const sub = this.subscription();
        if (sub?.days_remaining != null && !sub.is_expired) return sub.days_remaining;
        if (p?.trial_days_remaining != null && p.is_on_trial) return p.trial_days_remaining;
        return 0;
    }

    /** Date de fin affichée (abonnement ou essai). */
    endDateLabel(): string {
        const sub = this.subscription();
        const p = this.profile();
        if (sub?.ends_at) return new Date(sub.ends_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        if (p?.trial_ends_at) return new Date(p.trial_ends_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        return '—';
    }

    isTrial(): boolean {
        return !!this.profile()?.is_on_trial;
    }
}




