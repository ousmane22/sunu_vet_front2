import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Style du badge : primary (fond sombre) ou soft (fond clair). */
export type BadgeVariant = 'primary' | 'soft';

/**
 * Badge réutilisable pour afficher un compteur (ex: nombre d'articles).
 * Affiche "9+" si la valeur dépasse maxDisplay.
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (count() != null && (count()! > 0 || showWhenZero())) {
      <span
        class="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center leading-none shrink-0"
        [class.bg-primary-600]="variant() === 'primary'"
        [class.text-white]="variant() === 'primary'"
        [class.px-2]="variant() === 'soft'"
        [class.py-0.5]="variant() === 'soft'"
        [class.bg-primary-100]="variant() === 'soft'"
        [class.text-primary-700]="variant() === 'soft'"
        [class.text-xs]="variant() === 'soft'">
        {{ count()! > maxDisplay() ? (maxDisplay() + '+') : (count() ?? 0) }}
      </span>
    }
  `,
})
export class BadgeComponent {
  /** Valeur à afficher (masqué si 0 ou null) */
  count = input<number | null>(null);
  /** Au-delà de cette valeur on affiche "maxDisplay+" (défaut 9) */
  maxDisplay = input<number>(9);
  /** Apparence : primary (tab, notifications) ou soft (header panier) */
  variant = input<BadgeVariant>('primary');
  /** Afficher le badge même quand count vaut 0 (ex: header panier) */
  showWhenZero = input<boolean>(false);
}
