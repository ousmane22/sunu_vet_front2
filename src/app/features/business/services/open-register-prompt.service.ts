import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CashRegisterService } from './cash-register.service';
import { BusinessProfileService } from './business-profile.service';
import type { BusinessProfileResponse } from '../models';
import type { CashRegisterSingleResponse } from '../models/cash-register.model';

/** Vérifie qu'une caisse est ouverte avant une action de création (vente, consultation, dépense). */
@Injectable({ providedIn: 'root' })
export class OpenRegisterPromptService {
  private readonly cashRegisterService = inject(CashRegisterService);
  private readonly profileService = inject(BusinessProfileService);
  private readonly router = inject(Router);

  /**
   * À appeler juste avant une action de création. `true` = OK, `false` = caisse requise et
   * absente — l'appelant doit alors afficher la popup `app-open-register-prompt`.
   */
  canProceed(): Observable<boolean> {
    return forkJoin({
      register: this.cashRegisterService.getCurrent(true).pipe(
        catchError(() => of({ data: null } as CashRegisterSingleResponse)),
      ),
      profile: this.profileService.getProfile(true).pipe(
        catchError(() => of(null as unknown as BusinessProfileResponse)),
      ),
    }).pipe(
      map(({ register, profile }) => {
        if (!profile?.data) return true;
        const requireOpen = profile.data.settings?.require_open_register === true;
        return !requireOpen || !!register.data;
      }),
      catchError(() => of(true)),
    );
  }

  openRegisterPage(returnPath: string): void {
    this.router.navigate(['/business/cash-registers'], {
      queryParams: { returnUrl: returnPath },
    });
  }
}
