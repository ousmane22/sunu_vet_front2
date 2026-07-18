import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ContactModalService } from '../../services/contact-modal.service';

interface Plan {
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
  styleUrl: './pricing.component.scss'
})
export class PricingComponent implements OnInit {
  private http = inject(HttpClient);
  contactModal = inject(ContactModalService);
  plans: Plan[] = [];
  loading = true;

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans(): void {
    this.http.get<{data: Plan[]}>(`${environment.apiUrl}/subscription-plans`)
      .subscribe({
        next: (response) => {
          this.plans = response.data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.plans = this.getDefaultPlans();
        }
      });
  }

  getDefaultPlans(): Plan[] {
    return [
      {
        id: 1,
        name: 'Essai Gratuit',
        slug: 'trial',
        description: 'Période d\'essai de 15 jours',
        price: 0,
        formatted_price: '0 XOF',
        currency: 'XOF',
        duration_in_months: 0.5,
        max_users: 999,
        max_animals: 999999,
        features: [
          'Accès complet pendant 15 jours'
        ],
        is_popular: false
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
          'Accès complet à toutes les fonctionnalités'
        ],
        is_popular: true
      }
    ];
  }
}



