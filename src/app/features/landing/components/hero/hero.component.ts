import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingActionsService } from '../../services/landing-actions.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  actions = inject(LandingActionsService);
}
