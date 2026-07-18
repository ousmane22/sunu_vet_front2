import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-preview.component.html',
})
export class ProjectPreviewComponent {}
