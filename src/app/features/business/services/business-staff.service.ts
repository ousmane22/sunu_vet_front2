import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import type {
  StaffListResponse,
  StaffMemberResponse,
  StaffRoleOption,
  CreateStaffPayload,
  UpdateStaffPayload,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class BusinessStaffService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/business`;

  /** Cache partagé : une seule requête GET /staff pour tout l’espace business. */
  private staffCache$: Observable<StaffListResponse> | null = null;

  getRoles(): Observable<{ data: StaffRoleOption[] }> {
    return this.http.get<{ data: StaffRoleOption[] }>(`${this.baseUrl}/staff/roles`);
  }

  /**
   * Liste du personnel. Utilise un cache partagé : le premier appel déclenche la requête,
   * les suivants (Sales, Quotes, Payments, Staff) réutilisent le même résultat.
   * @param forceRefresh true pour forcer un nouvel appel API (ex. après création/édition).
   */
  getStaff(forceRefresh = false): Observable<StaffListResponse> {
    if (forceRefresh) {
      this.staffCache$ = null;
    }
    if (!this.staffCache$) {
      this.staffCache$ = this.http.get<StaffListResponse>(`${this.baseUrl}/staff`).pipe(
        tap({
          error: () => {
            this.staffCache$ = null;
          },
        }),
        catchError(() => of({ data: [] })),
        shareReplay(1)
      );
    }
    return this.staffCache$;
  }

  /** Invalide le cache après une modification (création, mise à jour, suppression). */
  invalidateStaffCache(): void {
    this.staffCache$ = null;
  }

  createStaff(payload: CreateStaffPayload): Observable<StaffMemberResponse> {
    return this.http.post<StaffMemberResponse>(`${this.baseUrl}/staff`, payload);
  }

  updateStaff(id: number, payload: UpdateStaffPayload): Observable<StaffMemberResponse> {
    return this.http.put<StaffMemberResponse>(`${this.baseUrl}/staff/${id}`, payload);
  }

  toggleStatus(id: number): Observable<StaffMemberResponse> {
    return this.http.patch<StaffMemberResponse>(`${this.baseUrl}/staff/${id}/toggle-status`, {});
  }

  getAvailablePermissions(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/roles/available-permissions`);
  }

  updatePermissions(id: number, permissions: string[]): Observable<StaffMemberResponse> {
    return this.http.put<StaffMemberResponse>(`${this.baseUrl}/staff/${id}/permissions`, { permissions });
  }
}




