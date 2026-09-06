import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppUpdateService } from './core/services/app-update.service';
import { SeoService } from './core/services/seo.service';
import { SunuDialogComponent } from './shared/components/sunu-dialog/sunu-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SunuDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';

  /** Initialise la détection des mises à jour PWA en production. */
  private readonly _appUpdate = inject(AppUpdateService);
  private readonly _seo = inject(SeoService);

  constructor() {
    this._seo.init();
  }
}


