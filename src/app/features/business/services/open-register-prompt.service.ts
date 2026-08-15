import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { CashRegisterService } from './cash-register.service';
import { BusinessProfileService } from './business-profile.service';
import type { OpenRegisterContext } from './open-register-session.service';
import { OpenRegisterSessionService } from './open-register-session.service';

/** Affiche le popup caisse à l'entrée POS / consultations si le paramètre l'exige. */
@Injectable({ providedIn: 'root' })
export class OpenRegisterPromptService {
  private readonly cashRegisterService = inject(CashRegisterService);
  private readonly profileService = inject(BusinessProfileService);
  private readonly session = inject(OpenRegisterSessionService);
  private readonly router = inject(Router);

  evaluatePrompt(context: OpenRegisterContext, setOpen: (value: boolean) => void): void {
    forkJoin({
      register: this.cashRegisterService.getCurrent(true),
      profile: this.profileService.getProfile(),
    }).subscribe({
      next: ({ register, profile }) => {
        const requireOpen = profile.data.settings?.require_open_register === true;

        if (!requireOpen) {
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
    return this.cashRegisterService.onChanged();
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
