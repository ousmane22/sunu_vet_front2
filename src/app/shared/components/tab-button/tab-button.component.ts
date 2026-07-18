import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Bouton d'onglet réutilisable : icône + libellé + badge optionnel.
 * Utilisable dans une barre d'onglets (ex: POS Produits / Panier).
 */
@Component({
  selector: 'app-tab-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="tab-btn flex-1 min-w-0 flex items-center justify-center gap-2.5 px-3 py-3.5 text-sm font-bold border-b-[3px] transition-colors"
      [class.tab-btn--active]="active()"
      [class.tab-btn--idle]="!active()"
      (click)="tabClick.emit()"
    >
      <span class="tab-btn__icon flex items-center justify-center shrink-0">
        <ng-content select="[tabIcon]"></ng-content>
      </span>
      <span class="inline-flex items-center gap-2 min-w-0">
        <span class="truncate">
          <ng-content select="[tabLabel]"></ng-content>
        </span>
        @if (badge() != null && badge()! > 0) {
          <span
            class="min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center leading-none shrink-0"
          >
            {{ badge()! > 99 ? '99+' : badge() }}
          </span>
        }
      </span>
    </button>
  `,
  styles: [`
    .tab-btn--active {
      border-color: var(--color-primary-600, #0d9488);
      color: var(--color-primary-700, #0f766e);
      background: color-mix(in srgb, var(--color-primary-50, #f0fdfa) 70%, transparent);
    }
    .tab-btn--idle {
      border-color: transparent;
      color: #71717a;
    }
    .tab-btn--idle:hover {
      color: #27272a;
      background: #fafafa;
    }
    .tab-btn__icon :is(svg) {
      width: 1.25rem;
      height: 1.25rem;
    }
  `],
})
export class TabButtonComponent {
  /** Onglet actif (style souligné / couleur primaire) */
  active = input<boolean>(false);
  /** Valeur optionnelle du badge (masqué si 0 ou null) */
  badge = input<number | null>(null);
  /** Émis au clic */
  tabClick = output<void>();
}
