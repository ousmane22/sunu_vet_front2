import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LandingActionsService } from '../../services/landing-actions.service';

@Component({
  selector: 'app-landing-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-nav.component.html',
})
export class LandingNavComponent {
  actions = inject(LandingActionsService);
  menuOpen = signal(false);
  scrolled = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 24);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }
}
