import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { DemoModalService } from '../../services/demo-modal.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private demoModal = inject(DemoModalService);

  openDemo(): void {
    this.demoModal.open();
  }

  /** Inscription si invité, sinon espace déjà connecté (même logique que Mon compte). */
  goToRegister(): void {
    if (this.authService.isAuthenticated()) {
      this.goToMyAccount();
      return;
    }
    void this.router.navigate(['/register']);
  }

  goToMyAccount(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    const isSuperAdmin = Array.isArray(user.roles) &&
      user.roles.some((r: string) => r === 'super-admin' || r === 'super_admin');
    if (isSuperAdmin) {
      this.router.navigate(['/super-admin']);
    } else if (user.business_id) {
      this.router.navigate(['/business', 'dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}



