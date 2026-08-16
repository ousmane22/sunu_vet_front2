import { ApplicationRef, inject, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { SunuDialogService } from '../../shared/services/sunu-dialog.service';
import { concat, filter, first, interval } from 'rxjs';

/** Détecte une nouvelle version PWA et propose de recharger. */
@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private readonly appRef = inject(ApplicationRef);
  private readonly swUpdate = inject(SwUpdate, { optional: true });
  private readonly dialog = inject(SunuDialogService);

  constructor() {
    if (!this.swUpdate?.isEnabled) {
      return;
    }

    const swUpdate = this.swUpdate;

    swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        void this.promptReload(swUpdate);
      });

    const appIsStable$ = this.appRef.isStable.pipe(first((stable) => stable));
    concat(appIsStable$, interval(5 * 60 * 1000)).subscribe(() => {
      void swUpdate.checkForUpdate();
    });
  }

  private async promptReload(swUpdate: SwUpdate): Promise<void> {
    const reload = await this.dialog.confirm(
      'Une nouvelle version de SunuVet est disponible. Recharger maintenant pour en profiter ?',
      {
        title: 'Mise à jour disponible',
        confirmText: 'Recharger',
        cancelText: 'Plus tard',
        type: 'info',
      },
    );

    if (!reload) {
      return;
    }

    await swUpdate.activateUpdate();
    document.location.reload();
  }
}
