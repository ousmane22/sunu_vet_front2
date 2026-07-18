import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
      <p class="text-sm font-semibold text-primary-600">404</p>
      <h1 class="mt-2 text-2xl font-bold text-gray-900">Page introuvable</h1>
      <p class="mt-2 max-w-md text-gray-600">
        L’adresse n’existe pas ou a été déplacée.
      </p>
      <a
        routerLink="/"
        class="mt-6 inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        Retour à l’accueil
      </a>
    </div>
  `,
})
export class PageNotFoundComponent {}
