import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BusinessProfileService } from '../../../features/business/services/business-profile.service';
import { CashRegisterService } from '../../../features/business/services/cash-register.service';

/**
 * Bloque l’accès si l’entreprise exige une caisse ouverte (`require_open_register`)
 * et qu’aucune session n’est ouverte pour l’utilisateur — même règle que le POS.
 * À appliquer aux routes « consultation » et « dépenses » (pas l’historique ventes seul).
 */
export const requireOpenRegisterGuard: CanActivateFn = () => {
  const router = inject(Router);
  const profileService = inject(BusinessProfileService);
  const cashRegisterService = inject(CashRegisterService);

  const redirect = () =>
    router.createUrlTree(['/business/cash-registers'], {
      queryParams: { reason: 'open_register_required' },
    });

  return forkJoin({
    profile: profileService.getProfile(true),
    register: cashRegisterService.getCurrent(true),
  }).pipe(
    map(({ profile, register }) => {
      const requireOpen = profile.data.settings?.require_open_register === true;
      if (!requireOpen) {
        return true;
      }
      if (register.data != null) {
        return true;
      }
      return redirect();
    }),
    catchError(() => of(redirect())),
  );
};
