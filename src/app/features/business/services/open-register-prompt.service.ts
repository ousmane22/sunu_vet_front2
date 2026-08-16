import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, merge, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CashRegisterService } from './cash-register.service';
import { BusinessProfileService } from './business-profile.service';
import type { OpenRegisterContext } from './open-register-session.service';
import { OpenRegisterSessionService } from './open-register-session.service';
import type { BusinessProfileResponse } from '../models';
import type { CashRegisterSingleResponse } from '../models/cash-register.model';

/** Affiche le popup caisse à l'entrée POS / consultations si le paramètre l'exige. */
@Injectable({ providedIn: 'root' })
export class OpenRegisterPromptService {
  private readonly cashRegisterService = inject(CashRegisterService);
  private readonly profileService = inject(BusinessProfileService);
  private readonly session = inject(OpenRegisterSessionService);
  private readonly router = inject(Router);

  evaluatePrompt(context: OpenRegisterContext, setOpen: (value: boolean) => void): void {
    forkJoin({
      register: this.cashRegisterService.getCurrent(true).pipe(
        catchError(() => of({ data: null } as CashRegisterSingleResponse)),
      ),
      profile: this.profileService.getProfile(true).pipe(
        catchError(() => of(null as unknown as BusinessProfileResponse)),
      ),
    }).subscribe({
      next: ({ register, profile }) => {
        if (!profile?.data) {
          setOpen(false);
          return;
        }

        const requireOpen = profile.data.settings?.require_open_register === true;

        if (!requireOpen) {
          this.session.resetContext(context);
          setOpen(false);
          return;
        }

        if (register.data) {
          this.session.resetContext(context);
          setOpen(false);
          return;
        }

        setOpen(true);
      },
      error: () => setOpen(false),
    });
  }

  watchRegisterChanges(context: OpenRegisterContext, setOpen: (value: boolean) => void): Observable<void> {
    return merge(
      this.cashRegisterService.onChanged(),
      this.profileService.onChanged(),
    ).pipe(
      tap(() => this.evaluatePrompt(context, setOpen)),
    );
  }

  openRegisterPage(returnPath: string): void {
    this.router.navigate(['/business/cash-registers'], {
      queryParams: { returnUrl: returnPath },
    });
  }

  leavePage(context: OpenRegisterContext): void {
    this.session.resetContext(context);
  }
}
