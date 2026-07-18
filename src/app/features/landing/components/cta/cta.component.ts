import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DemoModalService } from '../../services/demo-modal.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cta.component.html',
  styleUrl: './cta.component.scss'
})
export class CtaComponent {
  private demoModal = inject(DemoModalService);
  private router = inject(Router);
  private authService = inject(AuthService);

  openDemo(): void {
    this.demoModal.open();
  }

  goToRegister(): void {
    if (this.authService.isAuthenticated()) {
      const user = this.authService.currentUser();
      if (!user) {
        void this.router.navigate(['/login']);
        return;
      }
      const roles = user.roles ?? [];
      const isSuperAdmin = roles.some((r: string) => r === 'super-admin' || r === 'super_admin');
      if (isSuperAdmin) void this.router.navigate(['/super-admin']);
      else if (user.business_id) void this.router.navigate(['/business', 'dashboard']);
      else void this.router.navigate(['/login']);
      return;
    }
    void this.router.navigate(['/register']);
  }
}



