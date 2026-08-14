import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingActionsService } from '../../services/landing-actions.service';
import { LandingDashboardPreviewComponent } from '../project-preview/landing-dashboard-preview.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, LandingDashboardPreviewComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  actions = inject(LandingActionsService);
}
