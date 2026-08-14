import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { DemoModalService } from './demo-modal.service';
import { ContactModalService } from './contact-modal.service';

/** Navigation partagée landing (CTA, compte, démo). */
@Injectable({ providedIn: 'root' })
export class LandingActionsService {
  private router = inject(Router);
  private auth = inject(AuthService);
  private demoModal = inject(DemoModalService);
  private contactModal = inject(ContactModalService);

  goToRegister(): void {
    if (this.auth.isAuthenticated()) {
      this.goToMyAccount();
      return;
    }
    void this.router.navigate(['/register']);
  }

  goToMyAccount(): void {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login']);
      return;
    }
    const user = this.auth.currentUser();
    if (!user) {
      void this.router.navigate(['/login']);
      return;
    }
    const isSuperAdmin = (user.roles ?? []).some(
      (r: string) => r === 'super-admin' || r === 'super_admin',
    );
    if (isSuperAdmin) {
      void this.router.navigate(['/super-admin']);
    } else if (user.business_id) {
      void this.router.navigate(['/business', 'dashboard']);
    } else {
      void this.router.navigate(['/login']);
    }
  }

  openDemo(): void {
    this.demoModal.open();
  }

  openContact(): void {
    this.contactModal.open();
  }

  /** Scroll vers une section de la landing (conteneur app-landing, pas window). */
  scrollToSection(sectionId: string, event?: Event): void {
    event?.preventDefault();

    const performScroll = (): void => {
      const target = document.getElementById(sectionId);
      const root = document.querySelector('app-landing');
      if (!target || !root) return;

      const headerOffset = 72;
      const top = target.getBoundingClientRect().top + root.scrollTop - headerOffset;
      root.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };

    const onLanding = this.router.url === '/' || this.router.url.startsWith('/#');
    if (onLanding) {
      performScroll();
      return;
    }

    void this.router.navigate(['/'], { fragment: sectionId }).then(() => {
      requestAnimationFrame(() => requestAnimationFrame(performScroll));
    });
  }
}
