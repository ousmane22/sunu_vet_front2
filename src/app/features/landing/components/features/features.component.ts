import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss'
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      icon: 'fas fa-stethoscope',
      title: 'Gestion des Consultations',
      description: 'Dossiers médicaux complets, prescriptions, et historique des soins pour chaque animal.',
      color: 'bg-primary-100 text-primary-600'
    },
    {
      icon: 'fas fa-pills',
      title: 'Gestion du Stock',
      description: 'Suivi en temps réel, alertes de péremption, inventaires automatisés et FIFO.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: 'fas fa-cash-register',
      title: 'Point de Vente',
      description: 'Caisse intuitive, multi-paiements, tickets et factures automatiques.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: 'fas fa-users',
      title: 'Gestion des Clients',
      description: 'Fiches complètes, historique détaillé, programme de fidélité et rappels automatiques.',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Rapports & Statistiques',
      description: 'Tableaux de bord en temps réel, analyses financières et exports Excel.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: 'fas fa-boxes',
      title: 'Inventaire et facture',
      description: 'Rapports de stock analytique, inventaire physique et gestion des factures.',
      color: 'bg-red-100 text-red-600'
    }
  ];
}



