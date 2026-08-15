import { Injectable } from '@angular/core';

export type OpenRegisterContext = 'pos' | 'consultations';

/**
 * Mémorise le choix « continuer sans caisse » pour la visite courante d'une page (POS / consultations).
 * Réinitialisé à la sortie de la page.
 */
@Injectable({ providedIn: 'root' })
export class OpenRegisterSessionService {
  private readonly continuedWithout = new Set<OpenRegisterContext>();

  continueWithout(context: OpenRegisterContext): void {
    this.continuedWithout.add(context);
  }

  resetContext(context: OpenRegisterContext): void {
    this.continuedWithout.delete(context);
  }

  hasContinuedWithout(context: OpenRegisterContext): boolean {
    return this.continuedWithout.has(context);
  }

  /** Bloque l'UI tant que l'utilisateur n'a pas ouvert une caisse ou choisi de continuer. */
  shouldBlock(requireOpen: boolean, hasRegister: boolean, context: OpenRegisterContext): boolean {
    if (hasRegister) return false;
    if (this.hasContinuedWithout(context)) return false;
    return requireOpen;
  }
}
