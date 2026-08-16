import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PwaInstallService } from '../../../../../core/services/pwa-install.service';

@Component({
  selector: 'app-dashboard-pwa-prompt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-pwa-prompt.component.html',
  styles: [`
    @keyframes pwaFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    @keyframes pwaGlow {
      0%, 100% { box-shadow: 0 10px 40px -10px rgba(0, 71, 78, 0.35); }
      50% { box-shadow: 0 16px 48px -8px rgba(0, 109, 119, 0.45); }
    }

    .pwa-float {
      animation: pwaFloat 3.2s ease-in-out infinite;
    }

    .pwa-glow {
      animation: pwaGlow 3.2s ease-in-out infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .pwa-float,
      .pwa-glow {
        animation: none;
      }
    }
  `],
})
export class DashboardPwaPromptComponent {
  private readonly pwa = inject(PwaInstallService);
  private readonly router = inject(Router);

  installing = signal(false);
  dismissed = signal(false);
  hint = signal<string | null>(null);

  visible = computed(() => !this.dismissed() && !this.pwa.isStandalone());
  canInstallNow = computed(() => this.pwa.installReady());

  constructor() {
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
      this.dismissed.set(false);
      this.hint.set(null);
    });
  }

  dismiss(): void {
    this.dismissed.set(true);
    this.hint.set(null);
  }

  /** Un seul bouton : ouvre la fenêtre native d'installation si disponible. */
  async addToHomeScreen(): Promise<void> {
    if (this.installing()) return;

    this.hint.set(null);
    this.installing.set(true);

    try {
      await this.pwa.waitForInstallReady(6000);
      const outcome = await this.pwa.promptInstall();

      if (outcome === 'unavailable') {
        this.hint.set(this.fallbackHint());
      }
    } finally {
      this.installing.set(false);
    }
  }

  private fallbackHint(): string {
    if (this.pwa.isIosSafari()) {
      return 'Appuyez sur Partager, puis « Sur l\'écran d\'accueil » pour installer SunuVet.';
    }
    if (this.pwa.isMobileDevice()) {
      return 'Ouvrez le menu du navigateur (⋮) et choisissez « Installer SunuVet ».';
    }
    if (this.pwa.isChromeDesktop()) {
      return 'Menu ⋮ → Installer SunuVet. Ou cliquez sur l\'icône ⊕ dans la barre d\'adresse.';
    }
    return 'Ouvrez le menu du navigateur et choisissez « Installer SunuVet ».';
  }
}
