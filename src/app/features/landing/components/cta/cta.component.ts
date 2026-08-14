import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LandingActionsService } from '../../services/landing-actions.service';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cta.component.html',
  styleUrl: './cta.component.scss',
})
export class CtaComponent {
  actions = inject(LandingActionsService);
}
