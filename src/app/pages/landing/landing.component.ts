import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  features = [
    {
      icon: '🏥',
      title: 'Gestion Clinique',
      description: 'Gérez votre clinique vétérinaire de A à Z avec une interface intuitive et moderne.'
    },
    {
      icon: '📋',
      title: 'Consultations',
      description: 'Dossiers médicaux électroniques, prescriptions, historique complet des animaux.'
    },
    {
      icon: '💊',
      title: 'Gestion des Stocks',
      description: 'Contrôle en temps réel des médicaments, alertes automatiques, inventaires simplifiés.'
    },
    {
      icon: '💰',
      title: 'Point de Vente',
      description: 'Caisse intégrée, multi-paiements, facturation automatique et gestion comptable.'
    },
    {
      icon: '📊',
      title: 'Rapports & Analytics',
      description: 'Tableaux de bord en temps réel, statistiques avancées, exports comptables.'
    },
    {
      icon: '👥',
      title: 'Multi-utilisateurs',
      description: 'Rôles et permissions, gestion d\'équipe, traçabilité complète des actions.'
    }
  ];

  plans = [
    {
      name: 'Starter',
      price: '25 000',
      currency: 'XOF',
      period: '/mois',
      description: 'Parfait pour les petites cliniques',
      features: [
        '3 utilisateurs',
        '100 animaux',
        'Gestion consultations',
        'Point de vente',
        '500 Mo stockage',
        'Support email'
      ],
      highlighted: false
    },
    {
      name: 'Professional',
      price: '50 000',
      currency: 'XOF',
      period: '/mois',
      description: 'Pour les cliniques en croissance',
      features: [
        '10 utilisateurs',
        '500 animaux',
        'Tout du plan Starter',
        'Gestion stock avancée',
        'Notifications SMS',
        '2 Go stockage',
        'Support prioritaire'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: '100 000',
      currency: 'XOF',
      period: '/mois',
      description: 'Solution complète professionnelle',
      features: [
        '50 utilisateurs',
        'Animaux illimités',
        'Tout du plan Pro',
        'Multi-sites',
        'API complète',
        '10 Go stockage',
        'Support dédié 24/7'
      ],
      highlighted: false
    }
  ];

  testimonials = [
    {
      name: 'Dr. Aminata Sow',
      role: 'Vétérinaire, Dakar',
      image: '👩‍⚕️',
      text: 'SunuVet a révolutionné notre façon de travailler. Gain de temps considérable et zéro erreur sur les stocks.'
    },
    {
      name: 'Dr. Mamadou Diop',
      role: 'Directeur Clinique, Thiès',
      image: '👨‍⚕️',
      text: 'Interface intuitive, équipe réactive. Nos clients apprécient la modernité du système.'
    },
    {
      name: 'Khadija Ba',
      role: 'Gestionnaire, Saint-Louis',
      image: '👩‍💼',
      text: 'La gestion de caisse et des dépenses est devenue un jeu d\'enfant. Je recommande vivement !'
    }
  ];
}


