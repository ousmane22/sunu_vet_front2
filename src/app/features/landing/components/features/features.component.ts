import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  title: string;
  description: string;
  color: string;
  ring: string;
  icon: 'consultation' | 'stock' | 'pos' | 'clients' | 'reports' | 'inventory';
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      icon: 'consultation',
      title: 'Consultations',
      description: 'Fiches complètes, paiements partiels, crédit client et aide IA pour rédiger motif, examen, diagnostic et traitement.',
      color: 'bg-primary-100 text-primary-600',
      ring: 'ring-primary-100 group-hover:ring-primary-200',
    },
    {
      icon: 'stock',
      title: 'Stock & médicaments',
      description: 'Suivi des quantités, alertes stock bas, mouvements automatiques à chaque vente et historique par produit.',
      color: 'bg-green-100 text-green-600',
      ring: 'ring-green-100 group-hover:ring-green-200',
    },
    {
      icon: 'pos',
      title: 'Point de vente',
      description: 'Caisse intuitive, remises, espèces / carte / mobile money, tickets et gestion des ventes partielles.',
      color: 'bg-purple-100 text-purple-600',
      ring: 'ring-purple-100 group-hover:ring-purple-200',
    },
    {
      icon: 'clients',
      title: 'Clients & animaux',
      description: 'Fiches clients, historique ventes et consultations, solde dû et règlements ultérieurs.',
      color: 'bg-pink-100 text-pink-600',
      ring: 'ring-pink-100 group-hover:ring-pink-200',
    },
    {
      icon: 'reports',
      title: 'Rapports & tableau de bord',
      description: 'Encaissé vs facturé, performance, médical et trésorerie — les mêmes chiffres que dans votre activité quotidienne.',
      color: 'bg-orange-100 text-orange-600',
      ring: 'ring-orange-100 group-hover:ring-orange-200',
    },
    {
      icon: 'inventory',
      title: 'Inventaire physique',
      description: 'Sessions d’inventaire, écarts de stock et clôture contrôlée pour garder un stock fiable.',
      color: 'bg-red-100 text-red-600',
      ring: 'ring-red-100 group-hover:ring-red-200',
    },
  ];

  delayClass(index: number): string {
    if (index === 0) return '';
    if (index <= 5) return `reveal-delay-${index}`;
    return 'reveal-delay-5';
  }
}
