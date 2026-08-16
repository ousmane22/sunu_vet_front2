import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonial {
  name: string;
  role: string;
  business: string;
  initials: string;
  comment: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
})
export class TestimonialsComponent {
  testimonials: Testimonial[] = [
    {
      name: 'Dr. Mansour Diallo',
      role: 'Vétérinaire',
      business: 'Cabinet vétérinaire Kossy-Vet — Dakar',
      initials: 'MD',
      comment: 'SunuVet nous a permis de centraliser consultations et caisse. L’équipe gagne du temps chaque jour sur la paperasse.',
    },
    {
      name: 'Dr. Fallou Hann',
      role: 'Vétérinaire',
      business: 'Cabinet vétérinaire LAMP-FALL-VET — Pikine',
      initials: 'FH',
      comment: 'Le suivi du stock et les alertes nous évitent les ruptures. Les rapports encaissé / facturé sont très clairs.',
    },
    {
      name: 'Fatou Sall',
      role: 'Gérante',
      business: 'Clinique des Animaux — Rufisque',
      initials: 'FS',
      comment: 'Interface simple pour le staff, formation rapide. SunuVet Assistant aide déjà sur les fiches consultation.',
    },
  ];
}
