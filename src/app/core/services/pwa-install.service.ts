import { Injectable, signal } from '@angular/core';

/** Événement natif Chrome / Edge pour proposer l'installation PWA. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Détecte l'éligibilité PWA et déclenche l'installation native. */
@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  /** Le navigateur a capturé l'événement d'installation. */
  readonly installReady = signal(false);

  /** L'app tourne déjà en mode standalone (installée). */
  readonly isStandalone = signal(this.detectStandalone());

  constructor() {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.installReady.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.installReady.set(false);
      this.isStandalone.set(true);
    });
  }

  /** Safari iOS — pas de prompt natif, instructions manuelles. */
  isIosSafari(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/.test(ua);
    return isIos && isSafari;
  }

  /** Peut afficher la bannière (pas déjà installée). */
  canShowBanner(): boolean {
    return !this.isStandalone();
  }

  isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches
      || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  isDesktop(): boolean {
    return !this.isMobileDevice();
  }

  /** Lance le prompt natif d'installation. */
  async promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!this.deferredPrompt) return 'unavailable';

    await this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      this.deferredPrompt = null;
      this.installReady.set(false);
      this.isStandalone.set(true);
    }

    return outcome;
  }

  private detectStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  }

}
