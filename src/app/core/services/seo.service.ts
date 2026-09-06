import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SeoPageConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly _title = inject(Title);
  private readonly _meta = inject(Meta);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);

  private readonly _baseDomain = 'https://www.sunuvet.com';
  private readonly _defaultTitle = 'SunuVet — Logiciel de gestion pour cliniques vétérinaires';
  private readonly _defaultDescription =
    'SunuVet est le logiciel tout-en-un pour cliniques et cabinets vétérinaires au Sénégal et en Afrique : consultations, dossier médical, stock, caisse et assistant IA.';
  private readonly _defaultImage = 'https://www.sunuvet.com/assets/images/hero_image.png';

  /**
   * Initialise l'écoute des changements de route pour adapter les métadonnées SEO.
   */
  public init(): void {
    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        let currentRoute = this._activatedRoute;
        while (currentRoute.firstChild) {
          currentRoute = currentRoute.firstChild;
        }

        const data = currentRoute.snapshot.data ?? {};
        const title = currentRoute.snapshot.title;
        const path = this._router.url.split('?')[0];

        // Routes privées (espace business, super-admin, profil) -> noindex
        const isPrivate =
          path.startsWith('/business') ||
          path.startsWith('/super-admin') ||
          path.startsWith('/profile');

        this.updateTags({
          title: title ? `${title} — SunuVet` : this._defaultTitle,
          description: data['description'] ?? this._defaultDescription,
          keywords: data['keywords'],
          canonical: `${this._baseDomain}${path === '/' ? '' : path}`,
          noIndex: isPrivate || data['noIndex'] === true,
        });
      });
  }

  /**
   * Met à jour manuellement les balises SEO pour une page spécifique.
   */
  public updateTags(config: SeoPageConfig): void {
    const title = config.title || this._defaultTitle;
    const description = config.description || this._defaultDescription;
    const image = config.image || this._defaultImage;
    const canonical = config.canonical || this._baseDomain;

    // Titre
    this._title.setTitle(title);

    // Meta standards
    this._meta.updateTag({ name: 'description', content: description });
    if (config.keywords) {
      this._meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Robots
    if (config.noIndex) {
      this._meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this._meta.updateTag({
        name: 'robots',
        content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
      });
    }

    // Open Graph
    this._meta.updateTag({ property: 'og:title', content: title });
    this._meta.updateTag({ property: 'og:description', content: description });
    this._meta.updateTag({ property: 'og:image', content: image });
    this._meta.updateTag({ property: 'og:url', content: canonical });

    // Twitter
    this._meta.updateTag({ name: 'twitter:title', content: title });
    this._meta.updateTag({ name: 'twitter:description', content: description });
    this._meta.updateTag({ name: 'twitter:image', content: image });
    this._meta.updateTag({ name: 'twitter:url', content: canonical });

    // Canonical link
    this._updateCanonicalLink(canonical);
  }

  private _updateCanonicalLink(url: string): void {
    if (typeof document === 'undefined') return;

    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
