import { Component, input, output, effect, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Panneau latéral réutilisable (slide-over) pour tout le projet.
 *
 * Usage :
 * ```html
 * <app-slide-panel
 *   [open]="!!item()"
 *   [loading]="loading()"
 *   title="Titre"
 *   subtitle="Sous-titre"
 *   (closed)="close()">
 *   <!-- contenu -->
 *   <div slideFooter><!-- actions optionnelles en bas --></div>
 * </app-slide-panel>
 * ```
 *
 * Alias conservé : `app-detail-slide-over` (même composant).
 */
@Component({
  selector: 'app-slide-panel, app-detail-slide-over',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-slide-over.component.html',
})
export class DetailSlideOverComponent implements OnDestroy {
  /** Afficher le panneau */
  open = input<boolean>(false);
  /** Titre de l’en-tête */
  title = input<string>('');
  /** Sous-titre (ex. date, statut) */
  subtitle = input<string | null>(null);
  /** État de chargement (spinner à la place du contenu) */
  loading = input<boolean>(false);
  /** Largeur du panneau (Tailwind), défaut max-w-xl */
  panelClass = input<string>('max-w-xl');

  /** @deprecated Préférer `closed` — conservé pour compatibilité */
  closeSlideOver = output<void>();
  /** Émis à la fermeture (overlay, bouton ×, Échap) */
  closed = output<void>();

  constructor() {
    effect(() => {
      if (typeof document === 'undefined') return;
      document.body.style.overflow = this.open() ? 'hidden' : '';
    });
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.emitClose();
  }

  emitClose(): void {
    this.closed.emit();
    this.closeSlideOver.emit();
  }
}
