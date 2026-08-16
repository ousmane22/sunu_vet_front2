import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth/auth.interceptor';

// Register French locale globally
registerLocaleData(localeFr, 'fr');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'fr' },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:5000',
    }),
  ],
};


