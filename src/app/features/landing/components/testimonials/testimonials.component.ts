import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonial {
  name: string;
  role: string;
  business: string;
  avatar: string;
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  testimonials: Testimonial[] = [
    {
      name: 'Dr. Mansour',
      role: 'Vétérinaire',
      business: 'Kossy Vet',
      avatar: 'fas fa-user-md',
      rating: 5,
      comment: 'SunuVet a transformé notre façon de travailler. Plus besoin de paperasse, tout est centralisé et accessible en quelques clics.'
    },
    {
      name: 'Dr. Fallou Hann',
      role: 'Vétérinaire',
      business: 'Lamp Fall vet',
      avatar: 'fas fa-user-tie',
      rating: 5,
      comment: 'La gestion du stock est un vrai jeu d\'enfant. Les alertes automatiques nous évitent les ruptures et les périmés.'
    },
    {
      name: 'Dr. Fatou Sall',
      role: 'Directrice',
      business: 'Clinique des Animaux',
      avatar: 'fas fa-user-nurse',
      rating: 5,
      comment: 'Excellent rapport qualité-prix. Notre efficacité a augmenté de 40% depuis que nous utilisons SunuVet.'
    }
  ];
}



