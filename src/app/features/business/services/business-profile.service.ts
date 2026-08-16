import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import type {
  BusinessProfileResponse,
  BusinessProfileUpdatePayload,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class BusinessProfileService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/business`;

  /**
   * Cache du profil business.
   * Utilisé dans de nombreux composants (POS, header, settings…).
   * Un seul appel HTTP par session, invalidé après update/logo/subscribe.
   */
  private profile$: Observable<BusinessProfileResponse> | null = null;
  private readonly changed$ = new Subject<void>();

  /** Émis après toute invalidation (ex. paramètres caisse mis à jour). */
  onChanged(): Observable<void> {
    return this.changed$.asObservable();
  }

  getProfile(forceRefresh = false): Observable<BusinessProfileResponse> {
    if (forceRefresh) {
      this.profile$ = null;
    }
    if (!this.profile$) {
      this.profile$ = this.http
        .get<BusinessProfileResponse>(`${this.baseUrl}/profile`)
        .pipe(
          tap({ error: () => { this.profile$ = null; } }),
          shareReplay(1)
        );
    }
    return this.profile$;
  }

  /** Invalide le cache du profil après toute modification. */
  invalidateProfile(): void {
    this.profile$ = null;
    this.changed$.next();
  }

  updateProfile(payload: BusinessProfileUpdatePayload): Observable<BusinessProfileResponse & { message: string }> {
    return this.http
      .put<BusinessProfileResponse & { message: string }>(`${this.baseUrl}/profile`, payload)
      .pipe(tap({ next: () => this.invalidateProfile() }));
  }

  uploadLogo(file: File): Observable<BusinessProfileResponse & { message: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http
      .post<BusinessProfileResponse & { message: string }>(`${this.baseUrl}/profile/logo`, formData)
      .pipe(tap({ next: () => this.invalidateProfile() }));
  }

  /** Souscrit la entreprise au plan donné (ex. passage essai → mensuel). */
  subscribeToPlan(planId: number): Observable<BusinessProfileResponse & { message: string }> {
    return this.http
      .post<BusinessProfileResponse & { message: string }>(`${this.baseUrl}/subscribe/${planId}`, {})
      .pipe(tap({ next: () => this.invalidateProfile() }));
  }
}




