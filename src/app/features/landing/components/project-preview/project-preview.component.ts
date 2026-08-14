import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LandingActionsService } from '../../services/landing-actions.service';

@Component({
  selector: 'app-project-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-preview.component.html',
})
export class ProjectPreviewComponent {
  actions = inject(LandingActionsService);
}
