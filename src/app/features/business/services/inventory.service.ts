import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  InventorySession,
  InventoryListResponse,
  InventoryLineUpdatePayload,
} from '../models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/business/inventory`;

  list(params?: { status?: string; per_page?: number; page?: number }): Observable<InventoryListResponse> {
    return this.http.get<InventoryListResponse>(this.base, { params: params as any });
  }

  start(notes?: string): Observable<{ message: string; data: InventorySession }> {
    return this.http.post<{ message: string; data: InventorySession }>(this.base, { notes: notes ?? null });
  }

  get(id: number): Observable<{ data: InventorySession }> {
    return this.http.get<{ data: InventorySession }>(`${this.base}/${id}`);
  }

  updateLines(id: number, lines: InventoryLineUpdatePayload[]): Observable<{ data: InventorySession }> {
    return this.http.put<{ data: InventorySession }>(`${this.base}/${id}`, { lines });
  }

  complete(id: number): Observable<{ message: string; data: InventorySession }> {
    return this.http.post<{ message: string; data: InventorySession }>(`${this.base}/${id}/complete`, {});
  }

  cancel(id: number): Observable<{ message: string; data: InventorySession }> {
    return this.http.post<{ message: string; data: InventorySession }>(`${this.base}/${id}/cancel`, {});
  }
}
