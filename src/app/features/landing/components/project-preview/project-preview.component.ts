import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LandingActionsService } from '../../services/landing-actions.service';
import { LandingDashboardPreviewComponent } from './landing-dashboard-preview.component';

@Component({
  selector: 'app-project-preview',
  standalone: true,
  imports: [CommonModule, RouterLink, LandingDashboardPreviewComponent],
  templateUrl: './project-preview.component.html',
})
export class ProjectPreviewComponent {
  actions = inject(LandingActionsService);
}
